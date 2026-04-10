using Backend.DTOs;
using Backend.Entities;
using Backend.Enums;
using Backend.Helpers;
using Backend.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public interface IReportService
{
    Task<DashboardSummaryDto> GetDashboardSummaryAsync(int? branchId = null, CancellationToken cancellationToken = default);
    Task<List<DailyRevenueDto>> GetDailyRevenueAsync(int? branchId = null, CancellationToken cancellationToken = default);
    Task<List<PaymentDistributionDto>> GetPaymentDistributionAsync(int? branchId = null, CancellationToken cancellationToken = default);
    Task<List<TablePerformanceDto>> GetTablePerformanceAsync(int? branchId = null, CancellationToken cancellationToken = default);
    Task<List<TerminalPerformanceDto>> GetTerminalPerformanceAsync(int? branchId = null, CancellationToken cancellationToken = default);
    Task<List<FailedTransactionDto>> GetFailedTransactionsAsync(int? branchId = null, CancellationToken cancellationToken = default);
}

public class ReportService(
    IRepository<Branch> branchRepository,
    IRepository<RestaurantTable> tableRepository,
    IRepository<Bill> billRepository,
    IRepository<Payment> paymentRepository,
    IRepository<PosTerminal> terminalRepository,
    ITableLifecycleService tableLifecycleService) : IReportService
{
    public async Task<DashboardSummaryDto> GetDashboardSummaryAsync(int? branchId = null, CancellationToken cancellationToken = default)
    {
        var branch = await ResolveBranchAsync(branchId, cancellationToken);
        await tableLifecycleService.ReconcileAsync(branch.Id, cancellationToken);
        var tables = await tableRepository.Query()
            .AsNoTracking()
            .Where(x => x.BranchId == branch.Id)
            .ToListAsync(cancellationToken);

        var terminals = await terminalRepository.Query()
            .AsNoTracking()
            .Where(x => x.BranchId == branch.Id)
            .ToListAsync(cancellationToken);

        var successfulPaymentsTotal = await paymentRepository.Query()
            .AsNoTracking()
            .Where(x => x.Bill!.BranchId == branch.Id && x.Status == PaymentStatus.Basarili && x.PaymentType != PaymentType.Iade)
            .SumAsync(x => x.Amount, cancellationToken);

        return new DashboardSummaryDto
        {
            BranchName = branch.Name,
            BranchCode = branch.Code,
            ActiveTables = tables.Count(x => x.Status == RestaurantTableStatus.Dolu),
            ActiveOrders = tables.Count(x => x.Status is RestaurantTableStatus.Dolu or RestaurantTableStatus.OdemeBekliyor),
            PendingPayments = tables.Count(x => x.Status == RestaurantTableStatus.OdemeBekliyor),
            TotalRevenue = successfulPaymentsTotal,
            ConnectedTerminals = terminals.Count(x => x.Status != PosTerminalStatus.Cevrimdisi),
            OfflineTerminals = terminals.Count(x => x.Status == PosTerminalStatus.Cevrimdisi)
        };
    }

    public async Task<List<DailyRevenueDto>> GetDailyRevenueAsync(int? branchId = null, CancellationToken cancellationToken = default)
    {
        var branch = await ResolveBranchAsync(branchId, cancellationToken);
        var payments = await paymentRepository.Query()
            .AsNoTracking()
            .Include(x => x.Bill)
            .Where(x => x.Bill!.BranchId == branch.Id && x.Status == PaymentStatus.Basarili)
            .ToListAsync(cancellationToken);

        var data = payments
            .GroupBy(x => (x.CompletedAt ?? x.CreatedAt).Date)
            .OrderBy(x => x.Key)
            .Select(group => new DailyRevenueDto
            {
                Date = group.Key,
                CardAmount = group.Where(x => x.PaymentType == PaymentType.Kart).Sum(x => x.Amount),
                CashAmount = group.Where(x => x.PaymentType == PaymentType.Nakit).Sum(x => x.Amount),
                SplitAmount = group.Where(x => !string.IsNullOrWhiteSpace(x.SplitPaymentGroupId)).Sum(x => x.Amount),
                TotalAmount = group.Where(x => x.PaymentType != PaymentType.Iade).Sum(x => x.Amount) - group.Where(x => x.PaymentType == PaymentType.Iade).Sum(x => x.Amount)
            }).ToList();

        return data;
    }

    public async Task<List<PaymentDistributionDto>> GetPaymentDistributionAsync(int? branchId = null, CancellationToken cancellationToken = default)
    {
        var branch = await ResolveBranchAsync(branchId, cancellationToken);
        var payments = await paymentRepository.Query()
            .AsNoTracking()
            .Include(x => x.Bill)
            .Where(x => x.Bill!.BranchId == branch.Id && x.Status == PaymentStatus.Basarili)
            .ToListAsync(cancellationToken);

        var total = payments.Where(x => x.PaymentType != PaymentType.Iade).Sum(x => x.Amount);

        return payments
            .Where(x => x.PaymentType != PaymentType.Iade)
            .GroupBy(x => string.IsNullOrWhiteSpace(x.SplitPaymentGroupId) ? x.PaymentType.ToString() : PaymentType.BolunmusOdeme.ToString())
            .Select(group =>
            {
                var amount = group.Sum(x => x.Amount);
                return new PaymentDistributionDto
                {
                    PaymentType = group.Key,
                    TransactionCount = group.Count(),
                    Amount = amount,
                    Percentage = total == 0 ? 0 : Math.Round(amount * 100m / total, 2)
                };
            })
            .OrderByDescending(x => x.Amount)
            .ToList();
    }

    public async Task<List<TablePerformanceDto>> GetTablePerformanceAsync(int? branchId = null, CancellationToken cancellationToken = default)
    {
        var branch = await ResolveBranchAsync(branchId, cancellationToken);
        var bills = await billRepository.Query()
            .AsNoTracking()
            .Include(x => x.Table)
            .Where(x => x.BranchId == branch.Id && x.Status == BillStatus.Kapandi)
            .ToListAsync(cancellationToken);

        return bills
            .GroupBy(x => new { x.TableId, x.Table!.TableNo })
            .Select(group => new TablePerformanceDto
            {
                TableId = group.Key.TableId,
                TableNo = group.Key.TableNo,
                TransactionCount = group.Count(),
                Revenue = group.Sum(x => x.TotalAmount)
            })
            .OrderByDescending(x => x.Revenue)
            .Take(10)
            .ToList();
    }

    public async Task<List<TerminalPerformanceDto>> GetTerminalPerformanceAsync(int? branchId = null, CancellationToken cancellationToken = default)
    {
        var branch = await ResolveBranchAsync(branchId, cancellationToken);
        var terminals = await terminalRepository.Query()
            .AsNoTracking()
            .Where(x => x.BranchId == branch.Id)
            .ToListAsync(cancellationToken);
        var terminalIds = terminals.Select(x => x.Id).ToList();

        var payments = await paymentRepository.Query()
            .AsNoTracking()
            .Where(x => x.TerminalId.HasValue && terminalIds.Contains(x.TerminalId.Value))
            .ToListAsync(cancellationToken);

        return terminals.Select(terminal =>
        {
            var terminalPayments = payments.Where(x => x.TerminalId == terminal.Id).ToList();
            var successful = terminalPayments.Count(x => x.Status == PaymentStatus.Basarili);
            var processed = terminalPayments.Count(x => x.Status is PaymentStatus.Basarili or PaymentStatus.Basarisiz);

            return new TerminalPerformanceDto
            {
                TerminalId = terminal.Id,
                TerminalNo = terminal.TerminalNo,
                DeviceName = terminal.DeviceName,
                TransactionCount = terminalPayments.Count,
                TotalAmount = terminalPayments.Where(x => x.Status == PaymentStatus.Basarili).Sum(x => x.Amount),
                SuccessRate = processed == 0 ? 0 : Math.Round(successful * 100m / processed, 2),
                HealthStatus = terminal.Status.ToString()
            };
        }).OrderByDescending(x => x.TotalAmount).ToList();
    }

    public async Task<List<FailedTransactionDto>> GetFailedTransactionsAsync(int? branchId = null, CancellationToken cancellationToken = default)
    {
        var branch = await ResolveBranchAsync(branchId, cancellationToken);
        var failedPayments = await paymentRepository.Query()
            .AsNoTracking()
            .Include(x => x.Bill)
            .ThenInclude(x => x!.Table)
            .Include(x => x.Terminal)
            .Where(x => x.Bill!.BranchId == branch.Id && x.Status == PaymentStatus.Basarisiz)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        return failedPayments.Select(x => new FailedTransactionDto
        {
            PaymentId = x.Id,
            BillNo = x.Bill?.BillNo ?? string.Empty,
            TableNo = x.Bill?.Table?.TableNo ?? string.Empty,
            TerminalNo = x.Terminal?.TerminalNo,
            Amount = x.Amount,
            ErrorCode = x.ErrorCode ?? string.Empty,
            ErrorMessage = x.ErrorMessage ?? string.Empty,
            CreatedAt = x.CreatedAt
        }).ToList();
    }

    private async Task<Branch> ResolveBranchAsync(int? branchId, CancellationToken cancellationToken)
    {
        if (branchId.HasValue)
        {
            return await branchRepository.Query().AsNoTracking().FirstOrDefaultAsync(x => x.Id == branchId.Value, cancellationToken)
                ?? throw new NotFoundException("Branch not found.");
        }

        return await branchRepository.Query().AsNoTracking().OrderBy(x => x.Id).FirstOrDefaultAsync(cancellationToken)
            ?? throw new NotFoundException("No branch configured.");
    }
}
