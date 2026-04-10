using Backend.DTOs;
using Backend.Entities;
using Backend.Enums;
using Backend.Helpers;
using Backend.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public interface IPaymentService
{
    Task<List<PaymentDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<PaymentDto> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<List<PaymentDto>> GetByBillIdAsync(int billId, CancellationToken cancellationToken = default);
    Task<PaymentDto> CreateCashPaymentAsync(CashPaymentRequest request, CancellationToken cancellationToken = default);
    Task<PaymentDto> CreateCardPaymentAsync(CardPaymentRequest request, CancellationToken cancellationToken = default);
    Task<SplitPaymentResultDto> CreateSplitPaymentAsync(SplitPaymentRequest request, CancellationToken cancellationToken = default);
    Task<PaymentDto> CreateRefundAsync(RefundPaymentRequest request, CancellationToken cancellationToken = default);
    Task<PaymentDto> RetryAsync(int id, CancellationToken cancellationToken = default);
    Task<PaymentDto> CancelAsync(int id, CancellationToken cancellationToken = default);
    Task<List<TransactionHistoryItemDto>> GetTransactionHistoryAsync(CancellationToken cancellationToken = default);
    Task<TransactionDetailDto> GetTransactionDetailAsync(int id, CancellationToken cancellationToken = default);
}

public class PaymentService(
    IRepository<Payment> paymentRepository,
    IRepository<Bill> billRepository,
    IRepository<PosTerminal> terminalRepository,
    IReferenceGenerator referenceGenerator,
    IPosGateway posGateway,
    IBillCalculator billCalculator,
    ITableLifecycleService tableLifecycleService,
    ICurrentUserService currentUserService,
    IAuditLogService auditLogService,
    IUnitOfWork unitOfWork) : IPaymentService
{
    public async Task<List<PaymentDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var payments = await PaymentQuery().OrderByDescending(x => x.CreatedAt).ToListAsync(cancellationToken);
        return payments.Select(MapPayment).ToList();
    }

    public async Task<PaymentDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var payment = await PaymentQuery().FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Payment not found.");
        return MapPayment(payment);
    }

    public async Task<List<PaymentDto>> GetByBillIdAsync(int billId, CancellationToken cancellationToken = default)
    {
        var payments = await PaymentQuery()
            .Where(x => x.BillId == billId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        return payments.Select(MapPayment).ToList();
    }

    public async Task<PaymentDto> CreateCashPaymentAsync(CashPaymentRequest request, CancellationToken cancellationToken = default)
    {
        var bill = await LoadBillAsync(request.BillId, cancellationToken);
        EnsureBillCanReceivePayment(bill, request.Amount);

        var payment = new Payment
        {
            BillId = bill.Id,
            PaymentType = PaymentType.Nakit,
            Amount = request.Amount,
            Status = PaymentStatus.Basarili,
            ReferenceNo = referenceGenerator.CreatePaymentReference(),
            CompletedAt = DateTime.UtcNow,
            CreatedByUserId = ResolveUserId()
        };

        await paymentRepository.AddAsync(payment, cancellationToken);
        billCalculator.Recalculate(bill);
        await tableLifecycleService.SyncBillTablesAsync(bill, cancellationToken);
        billRepository.Update(bill);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        await auditLogService.CreateAsync(currentUserService.UserId, "CashPayment", nameof(Payment), payment.Id.ToString(), $"Cash payment created for bill {bill.BillNo}.", currentUserService.IpAddress, cancellationToken);
        return await GetByIdAsync(payment.Id, cancellationToken);
    }

    public async Task<PaymentDto> CreateCardPaymentAsync(CardPaymentRequest request, CancellationToken cancellationToken = default)
    {
        var bill = await LoadBillAsync(request.BillId, cancellationToken);
        EnsureBillCanReceivePayment(bill, request.Amount);

        var terminal = await terminalRepository.GetByIdAsync(request.TerminalId, cancellationToken)
            ?? throw new BadRequestException("Terminal not found.");
        if (!terminal.IsActive)
        {
            throw new BadRequestException("Terminal is inactive.");
        }

        var payment = new Payment
        {
            BillId = bill.Id,
            TerminalId = terminal.Id,
            PaymentType = PaymentType.Kart,
            Amount = request.Amount,
            Status = PaymentStatus.PosaGonderildi,
            ReferenceNo = referenceGenerator.CreatePaymentReference(),
            CardMaskedPan = request.CardMaskedPan,
            CreatedByUserId = ResolveUserId()
        };

        await paymentRepository.AddAsync(payment, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var gatewayResult = await posGateway.ProcessCardPaymentAsync(terminal, request.Amount, request.CardMaskedPan, cancellationToken);
        payment.Status = gatewayResult.IsSuccess ? PaymentStatus.Basarili : PaymentStatus.Basarisiz;
        payment.ReferenceNo = gatewayResult.ReferenceNo;
        payment.BankApprovalCode = gatewayResult.ApprovalCode;
        payment.ErrorCode = gatewayResult.ErrorCode;
        payment.ErrorMessage = gatewayResult.ErrorMessage;
        payment.CompletedAt = DateTime.UtcNow;

        terminal.Status = gatewayResult.TerminalStatus;
        terminal.LastConnectionAt = DateTime.UtcNow;
        if (gatewayResult.IsSuccess)
        {
            terminal.LastSuccessfulTransactionAt = DateTime.UtcNow;
        }

        paymentRepository.Update(payment);
        terminalRepository.Update(terminal);
        billCalculator.Recalculate(bill);
        await tableLifecycleService.SyncBillTablesAsync(bill, cancellationToken);
        billRepository.Update(bill);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        await auditLogService.CreateAsync(currentUserService.UserId, "CardPayment", nameof(Payment), payment.Id.ToString(), $"Card payment attempted for bill {bill.BillNo}.", currentUserService.IpAddress, cancellationToken);
        return await GetByIdAsync(payment.Id, cancellationToken);
    }

    public async Task<SplitPaymentResultDto> CreateSplitPaymentAsync(SplitPaymentRequest request, CancellationToken cancellationToken = default)
    {
        var bill = await LoadBillAsync(request.BillId, cancellationToken);
        var remainingAmount = bill.RemainingAmount;
        var totalRequestedAmount = request.Parts.Sum(x => x.Amount);

        if (Math.Abs(totalRequestedAmount - remainingAmount) > 0.01m)
        {
            throw new BadRequestException("Split payment amounts must match the remaining bill amount.");
        }

        var groupId = referenceGenerator.CreateSplitGroupId();
        var createdPayments = new List<Payment>();

        foreach (var part in request.Parts)
        {
            if (part.Method == PaymentType.Nakit)
            {
                var payment = new Payment
                {
                    BillId = bill.Id,
                    PaymentType = PaymentType.Nakit,
                    Amount = part.Amount,
                    Status = PaymentStatus.Basarili,
                    ReferenceNo = referenceGenerator.CreatePaymentReference(),
                    CompletedAt = DateTime.UtcNow,
                    CreatedByUserId = ResolveUserId(),
                    SplitPaymentGroupId = groupId
                };

                await paymentRepository.AddAsync(payment, cancellationToken);
                createdPayments.Add(payment);
            }
            else
            {
                if (!part.TerminalId.HasValue)
                {
                    throw new BadRequestException("Card split payments require a terminal.");
                }

                var terminal = await terminalRepository.GetByIdAsync(part.TerminalId.Value, cancellationToken)
                    ?? throw new BadRequestException("Split payment terminal not found.");

                var payment = new Payment
                {
                    BillId = bill.Id,
                    TerminalId = terminal.Id,
                    PaymentType = PaymentType.Kart,
                    Amount = part.Amount,
                    Status = PaymentStatus.PosaGonderildi,
                    ReferenceNo = referenceGenerator.CreatePaymentReference(),
                    CardMaskedPan = part.CardMaskedPan,
                    CreatedByUserId = ResolveUserId(),
                    SplitPaymentGroupId = groupId
                };

                await paymentRepository.AddAsync(payment, cancellationToken);
                await unitOfWork.SaveChangesAsync(cancellationToken);

                var gatewayResult = await posGateway.ProcessCardPaymentAsync(terminal, part.Amount, part.CardMaskedPan, cancellationToken);
                payment.Status = gatewayResult.IsSuccess ? PaymentStatus.Basarili : PaymentStatus.Basarisiz;
                payment.ReferenceNo = gatewayResult.ReferenceNo;
                payment.BankApprovalCode = gatewayResult.ApprovalCode;
                payment.ErrorCode = gatewayResult.ErrorCode;
                payment.ErrorMessage = gatewayResult.ErrorMessage;
                payment.CompletedAt = DateTime.UtcNow;

                terminal.Status = gatewayResult.TerminalStatus;
                terminal.LastConnectionAt = DateTime.UtcNow;
                if (gatewayResult.IsSuccess)
                {
                    terminal.LastSuccessfulTransactionAt = DateTime.UtcNow;
                }

                paymentRepository.Update(payment);
                terminalRepository.Update(terminal);
                createdPayments.Add(payment);
            }
        }

        billCalculator.Recalculate(bill);
        await tableLifecycleService.SyncBillTablesAsync(bill, cancellationToken);
        billRepository.Update(bill);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        await auditLogService.CreateAsync(currentUserService.UserId, "SplitPayment", nameof(Payment), groupId, $"Split payment processed for bill {bill.BillNo}.", currentUserService.IpAddress, cancellationToken);
        return new SplitPaymentResultDto
        {
            GroupId = groupId,
            TotalAmount = bill.TotalAmount,
            PaidAmount = bill.PaidAmount,
            RemainingAmount = bill.RemainingAmount,
            Payments = createdPayments.Select(MapPayment).ToList()
        };
    }

    public async Task<PaymentDto> CreateRefundAsync(RefundPaymentRequest request, CancellationToken cancellationToken = default)
    {
        var originalPayment = await paymentRepository.Query()
            .Include(x => x.Bill)
            .ThenInclude(x => x!.Payments)
            .Include(x => x.Bill)
            .ThenInclude(x => x!.Table)
            .Include(x => x.Terminal)
            .Include(x => x.CreatedByUser)
            .Include(x => x.RefundPayments)
            .FirstOrDefaultAsync(x => x.Id == request.OriginalPaymentId, cancellationToken)
            ?? throw new NotFoundException("Original payment not found.");
        var bill = originalPayment.Bill ?? throw new ConflictException("Original payment is not linked to a bill.");

        if (originalPayment.Status != PaymentStatus.Basarili)
        {
            throw new ConflictException("Only successful payments can be refunded.");
        }

        if (originalPayment.PaymentType == PaymentType.Iade)
        {
            throw new ConflictException("Refund transactions cannot be refunded again.");
        }

        var refundedAmount = originalPayment.RefundPayments.Where(x => x.Status == PaymentStatus.Basarili).Sum(x => x.Amount);
        if (request.Amount > originalPayment.Amount - refundedAmount)
        {
            throw new BadRequestException("Refund amount exceeds original payment balance.");
        }

        PosTerminal? terminal = null;
        PosGatewayResult? gatewayResult = null;
        if (originalPayment.PaymentType == PaymentType.Kart || request.TerminalId.HasValue)
        {
            var terminalId = request.TerminalId ?? originalPayment.TerminalId ?? throw new BadRequestException("Refund terminal is required.");
            terminal = await terminalRepository.GetByIdAsync(terminalId, cancellationToken)
                ?? throw new BadRequestException("Refund terminal not found.");
            gatewayResult = await posGateway.ProcessRefundAsync(terminal, request.Amount, originalPayment.ReferenceNo, cancellationToken);
        }

        var refundPayment = new Payment
        {
            BillId = originalPayment.BillId,
            TerminalId = terminal?.Id,
            PaymentType = PaymentType.Iade,
            Amount = request.Amount,
            Status = gatewayResult is null ? PaymentStatus.Basarili : gatewayResult.IsSuccess ? PaymentStatus.Basarili : PaymentStatus.Basarisiz,
            ReferenceNo = gatewayResult?.ReferenceNo ?? referenceGenerator.CreatePaymentReference(),
            BankApprovalCode = gatewayResult?.ApprovalCode,
            ErrorCode = gatewayResult?.ErrorCode,
            ErrorMessage = gatewayResult?.ErrorMessage,
            CompletedAt = DateTime.UtcNow,
            CreatedByUserId = ResolveUserId(),
            OriginalPaymentId = originalPayment.Id,
            Notes = request.Description,
            RefundReason = request.Reason
        };

        await paymentRepository.AddAsync(refundPayment, cancellationToken);

        if (terminal is not null)
        {
            terminal.Status = gatewayResult!.TerminalStatus;
            terminal.LastConnectionAt = DateTime.UtcNow;
            terminalRepository.Update(terminal);
        }

        billCalculator.Recalculate(bill);
        await tableLifecycleService.SyncBillTablesAsync(bill, cancellationToken);
        billRepository.Update(bill);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        await auditLogService.CreateAsync(currentUserService.UserId, "Refund", nameof(Payment), refundPayment.Id.ToString(), $"Refund created for payment {originalPayment.ReferenceNo}.", currentUserService.IpAddress, cancellationToken);
        return await GetByIdAsync(refundPayment.Id, cancellationToken);
    }

    public async Task<PaymentDto> RetryAsync(int id, CancellationToken cancellationToken = default)
    {
        var payment = await paymentRepository.Query()
            .Include(x => x.Bill)
            .ThenInclude(x => x!.Payments)
            .Include(x => x.Bill)
            .ThenInclude(x => x!.Table)
            .Include(x => x.Terminal)
            .Include(x => x.CreatedByUser)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Payment not found.");

        if (payment.Status != PaymentStatus.Basarisiz || payment.PaymentType != PaymentType.Kart || payment.Terminal is null)
        {
            throw new ConflictException("Only failed card payments can be retried.");
        }

        payment.Status = PaymentStatus.PosaGonderildi;
        paymentRepository.Update(payment);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var gatewayResult = await posGateway.ProcessCardPaymentAsync(payment.Terminal, payment.Amount, payment.CardMaskedPan, cancellationToken);
        payment.Status = gatewayResult.IsSuccess ? PaymentStatus.Basarili : PaymentStatus.Basarisiz;
        payment.ReferenceNo = gatewayResult.ReferenceNo;
        payment.BankApprovalCode = gatewayResult.ApprovalCode;
        payment.ErrorCode = gatewayResult.ErrorCode;
        payment.ErrorMessage = gatewayResult.ErrorMessage;
        payment.CompletedAt = DateTime.UtcNow;

        payment.Terminal.Status = gatewayResult.TerminalStatus;
        payment.Terminal.LastConnectionAt = DateTime.UtcNow;
        if (gatewayResult.IsSuccess)
        {
            payment.Terminal.LastSuccessfulTransactionAt = DateTime.UtcNow;
        }

        paymentRepository.Update(payment);
        terminalRepository.Update(payment.Terminal);

        billCalculator.Recalculate(payment.Bill!);
        await tableLifecycleService.SyncBillTablesAsync(payment.Bill!, cancellationToken);
        billRepository.Update(payment.Bill!);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        await auditLogService.CreateAsync(currentUserService.UserId, "RetryPayment", nameof(Payment), payment.Id.ToString(), $"Payment {payment.Id} retried.", currentUserService.IpAddress, cancellationToken);
        return MapPayment(payment);
    }

    public async Task<PaymentDto> CancelAsync(int id, CancellationToken cancellationToken = default)
    {
        var payment = await paymentRepository.Query()
            .Include(x => x.Bill)
            .ThenInclude(x => x!.Payments)
            .Include(x => x.Bill)
            .ThenInclude(x => x!.Table)
            .Include(x => x.Terminal)
            .Include(x => x.CreatedByUser)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Payment not found.");

        if (payment.Status == PaymentStatus.Basarili)
        {
            throw new ConflictException("Successful payments cannot be cancelled. Use refund.");
        }

        payment.Status = PaymentStatus.IptalEdildi;
        payment.ErrorMessage = payment.ErrorMessage ?? "Cancelled by user.";
        payment.CompletedAt = DateTime.UtcNow;
        paymentRepository.Update(payment);

        billCalculator.Recalculate(payment.Bill!);
        await tableLifecycleService.SyncBillTablesAsync(payment.Bill!, cancellationToken);
        billRepository.Update(payment.Bill!);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        await auditLogService.CreateAsync(currentUserService.UserId, "CancelPayment", nameof(Payment), payment.Id.ToString(), $"Payment {payment.Id} cancelled.", currentUserService.IpAddress, cancellationToken);
        return MapPayment(payment);
    }

    public async Task<List<TransactionHistoryItemDto>> GetTransactionHistoryAsync(CancellationToken cancellationToken = default)
    {
        var payments = await PaymentQuery()
            .Where(x => x.Status != PaymentStatus.Bekliyor)
            .OrderByDescending(x => x.CompletedAt ?? x.CreatedAt)
            .ToListAsync(cancellationToken);

        var groupedResult = new List<TransactionHistoryItemDto>();
        var groupedPayments = payments.Where(x => !string.IsNullOrWhiteSpace(x.SplitPaymentGroupId))
            .GroupBy(x => x.SplitPaymentGroupId!);

        foreach (var group in groupedPayments)
        {
            var sample = group.First();
            groupedResult.Add(new TransactionHistoryItemDto
            {
                Id = sample.Id,
                TransactionDate = group.Max(x => x.CompletedAt ?? x.CreatedAt),
                TableNo = sample.Bill?.Table?.TableNo ?? string.Empty,
                BillNo = sample.Bill?.BillNo ?? string.Empty,
                TerminalNo = sample.Terminal?.TerminalNo ?? string.Empty,
                TransactionTypeLabel = "BolunmusOdeme",
                PaymentTypeLabel = "BolunmusOdeme",
                Amount = group.Sum(x => x.Amount),
                StatusLabel = MapStatusLabel(group),
                ReferenceNo = group.FirstOrDefault(x => !string.IsNullOrWhiteSpace(x.ReferenceNo))?.ReferenceNo,
                OriginalPaymentId = null,
                OriginalReferenceNo = null,
                RefundReason = null
            });
        }

        var standalonePayments = payments.Where(x => string.IsNullOrWhiteSpace(x.SplitPaymentGroupId));
        groupedResult.AddRange(standalonePayments.Select(payment => new TransactionHistoryItemDto
        {
            Id = payment.Id,
            TransactionDate = payment.CompletedAt ?? payment.CreatedAt,
            TableNo = payment.Bill?.Table?.TableNo ?? string.Empty,
            BillNo = payment.Bill?.BillNo ?? string.Empty,
            TerminalNo = payment.Terminal?.TerminalNo ?? string.Empty,
            TransactionTypeLabel = MapTransactionTypeLabel(payment),
            PaymentTypeLabel = MapPaymentTypeLabel(payment),
            Amount = payment.Amount,
            StatusLabel = MapStatusLabel(payment.Status),
            ReferenceNo = payment.ReferenceNo,
            OriginalPaymentId = payment.OriginalPaymentId,
            OriginalReferenceNo = payment.OriginalPayment?.ReferenceNo,
            RefundReason = payment.RefundReason
        }));

        return groupedResult.OrderByDescending(x => x.TransactionDate).ToList();
    }

    public async Task<TransactionDetailDto> GetTransactionDetailAsync(int id, CancellationToken cancellationToken = default)
    {
        var payment = await PaymentQuery().FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Payment not found.");

        var relatedPayments = string.IsNullOrWhiteSpace(payment.SplitPaymentGroupId)
            ? [payment]
            : await PaymentQuery().Where(x => x.SplitPaymentGroupId == payment.SplitPaymentGroupId).ToListAsync(cancellationToken);

        var amount = relatedPayments.Sum(x => x.Amount);
        var latestDate = relatedPayments.Max(x => x.CompletedAt ?? x.CreatedAt);
        var representative = relatedPayments.OrderByDescending(x => x.CompletedAt ?? x.CreatedAt).First();

        return new TransactionDetailDto
        {
            Id = payment.Id,
            ReceiptNo = representative.Bill?.BillNo ?? string.Empty,
            TableNo = representative.Bill?.Table?.TableNo ?? string.Empty,
            Waiter = representative.Bill?.Waiter?.FullName ?? string.Empty,
            TerminalId = representative.Terminal?.TerminalNo ?? string.Empty,
            TerminalName = representative.Terminal?.DeviceName ?? string.Empty,
            TransactionTypeLabel = string.IsNullOrWhiteSpace(payment.SplitPaymentGroupId) ? MapTransactionTypeLabel(representative) : "BolunmusOdeme",
            PaymentType = string.IsNullOrWhiteSpace(payment.SplitPaymentGroupId) ? MapPaymentTypeLabel(representative) : "BolunmusOdeme",
            Amount = amount,
            BankReference = representative.ReferenceNo,
            OriginalReferenceNo = representative.OriginalPayment?.ReferenceNo,
            OriginalPaymentId = representative.OriginalPaymentId,
            AuthCode = representative.BankApprovalCode,
            CardLastFour = representative.CardMaskedPan?[Math.Max(0, representative.CardMaskedPan.Length - 4)..],
            TransactionDate = latestDate,
            Status = MapStatusLabel(relatedPayments),
            ErrorReason = relatedPayments.FirstOrDefault(x => x.Status == PaymentStatus.Basarisiz)?.ErrorMessage,
            Notes = representative.Notes,
            RefundReason = representative.RefundReason,
            Items = representative.Bill?.Items.OrderBy(x => x.Id).Select(BillService.MapItem).ToList() ?? [],
            Timeline = BuildTimeline(relatedPayments, representative.Bill)
        };
    }

    public static PaymentDto MapPayment(Payment payment) => new()
    {
        Id = payment.Id,
        BillId = payment.BillId,
        BillNo = payment.Bill?.BillNo ?? string.Empty,
        TerminalId = payment.TerminalId,
        TerminalNo = payment.Terminal?.TerminalNo,
        PaymentType = payment.PaymentType,
        Amount = payment.Amount,
        Status = payment.Status,
        ReferenceNo = payment.ReferenceNo,
        BankApprovalCode = payment.BankApprovalCode,
        CardMaskedPan = payment.CardMaskedPan,
        ErrorCode = payment.ErrorCode,
        ErrorMessage = payment.ErrorMessage,
        CreatedAt = payment.CreatedAt,
        CompletedAt = payment.CompletedAt,
        CreatedByUserId = payment.CreatedByUserId,
        CreatedByUserName = payment.CreatedByUser?.FullName ?? string.Empty,
        OriginalPaymentId = payment.OriginalPaymentId,
        SplitPaymentGroupId = payment.SplitPaymentGroupId
    };

    private IQueryable<Payment> PaymentQuery()
    {
        return paymentRepository.Query()
            .AsNoTracking()
            .Include(x => x.Bill)
            .ThenInclude(x => x!.Table)
            .Include(x => x.Bill)
            .ThenInclude(x => x!.Waiter)
            .Include(x => x.Bill)
            .ThenInclude(x => x!.Items)
            .Include(x => x.Terminal)
            .Include(x => x.OriginalPayment)
            .Include(x => x.CreatedByUser);
    }

    private async Task<Bill> LoadBillAsync(int billId, CancellationToken cancellationToken)
    {
        return await billRepository.Query()
            .Include(x => x.Table)
            .Include(x => x.Waiter)
            .Include(x => x.Items)
            .Include(x => x.Payments)
            .FirstOrDefaultAsync(x => x.Id == billId, cancellationToken)
            ?? throw new NotFoundException("Bill not found.");
    }

    private static void EnsureBillCanReceivePayment(Bill bill, decimal amount)
    {
        if (bill.Status == BillStatus.Iptal)
        {
            throw new ConflictException("Cancelled bills cannot receive payments.");
        }

        if (bill.RemainingAmount == 0)
        {
            throw new ConflictException("Bill is already fully paid.");
        }

        if (amount <= 0 || amount > bill.RemainingAmount)
        {
            throw new BadRequestException("Payment amount must be greater than zero and less than or equal to the remaining amount.");
        }
    }

    private int ResolveUserId() => currentUserService.UserId ?? throw new UnauthorizedAppException("Current user could not be resolved.");

    private static string MapStatusLabel(IEnumerable<Payment> payments)
    {
        var statuses = payments.Select(x => x.Status).ToHashSet();
        if (statuses.Contains(PaymentStatus.Basarisiz))
        {
            return "Basarisiz";
        }

        if (statuses.All(x => x == PaymentStatus.IptalEdildi))
        {
            return "Iptal";
        }

        if (statuses.All(x => x == PaymentStatus.Basarili))
        {
            return "Basarili";
        }

        return "Bekliyor";
    }

    private static string MapStatusLabel(PaymentStatus status) => status switch
    {
        PaymentStatus.Basarili => "Basarili",
        PaymentStatus.Basarisiz => "Basarisiz",
        PaymentStatus.IptalEdildi => "Iptal",
        _ => "Bekliyor"
    };

    private static string MapTransactionTypeLabel(Payment payment)
    {
        if (payment.PaymentType == PaymentType.Iade)
        {
            return "Iade";
        }

        if (payment.Status == PaymentStatus.IptalEdildi)
        {
            return "Iptal";
        }

        return "Odeme";
    }

    private static string MapPaymentTypeLabel(Payment payment)
    {
        if (payment.PaymentType == PaymentType.Iade)
        {
            return payment.OriginalPayment?.PaymentType.ToString() ?? payment.PaymentType.ToString();
        }

        return payment.PaymentType.ToString();
    }

    private static List<TransactionTimelineItemDto> BuildTimeline(IEnumerable<Payment> payments, Bill? bill)
    {
        var orderedPayments = payments.OrderBy(x => x.CreatedAt).ToList();
        var timeline = new List<TransactionTimelineItemDto>();

        if (bill is not null)
        {
            timeline.Add(new TransactionTimelineItemDto
            {
                Label = "Adisyon Olusturuldu",
                Timestamp = bill.OpenedAt,
                Status = "completed",
                Detail = $"Bill {bill.BillNo} opened for table {bill.Table?.TableNo}."
            });
        }

        foreach (var payment in orderedPayments)
        {
            timeline.Add(new TransactionTimelineItemDto
            {
                Label = payment.PaymentType == PaymentType.Iade ? "Iade Talebi Alindi" : "Odeme Talebi Alindi",
                Timestamp = payment.CreatedAt,
                Status = "completed",
                Detail = payment.PaymentType == PaymentType.Iade
                    ? payment.RefundReason ?? $"Refund requested for {payment.OriginalPayment?.ReferenceNo ?? payment.ReferenceNo}."
                    : $"{payment.PaymentType} payment requested."
            });

            timeline.Add(new TransactionTimelineItemDto
            {
                Label = payment.Status switch
                {
                    PaymentStatus.Basarili when payment.PaymentType == PaymentType.Iade => "Iade Basarili",
                    PaymentStatus.Basarili => "Odeme Basarili",
                    PaymentStatus.Basarisiz when payment.PaymentType == PaymentType.Iade => "Iade Basarisiz",
                    PaymentStatus.Basarisiz => "Odeme Basarisiz",
                    PaymentStatus.IptalEdildi => "Odeme Iptal Edildi",
                    _ => "Odeme Durumu"
                },
                Timestamp = payment.CompletedAt ?? payment.CreatedAt,
                Status = payment.Status == PaymentStatus.Basarili
                    ? "completed"
                    : payment.Status == PaymentStatus.Basarisiz || payment.Status == PaymentStatus.IptalEdildi
                        ? "failed"
                        : "pending",
                Detail = payment.Status == PaymentStatus.IptalEdildi
                    ? payment.ErrorMessage ?? "Payment cancelled."
                    : payment.ErrorMessage ?? payment.ReferenceNo
            });
        }

        return timeline;
    }
}
