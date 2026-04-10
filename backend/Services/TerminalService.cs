using Backend.DTOs;
using Backend.Entities;
using Backend.Enums;
using Backend.Helpers;
using Backend.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public interface ITerminalService
{
    Task<List<PosTerminalDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<PosTerminalDto> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<List<PosTerminalDto>> GetByBranchIdAsync(int branchId, CancellationToken cancellationToken = default);
    Task<PosTerminalDto> CreateAsync(UpsertPosTerminalRequest request, CancellationToken cancellationToken = default);
    Task<PosTerminalDto> UpdateAsync(int id, UpsertPosTerminalRequest request, CancellationToken cancellationToken = default);
    Task DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<PosTerminalDto> SetDefaultAsync(int id, CancellationToken cancellationToken = default);
    Task<PosTerminalDto> UpdateStatusAsync(int id, UpdateTerminalStatusRequest request, CancellationToken cancellationToken = default);
    Task<TerminalTestConnectionDto> TestConnectionAsync(int id, CancellationToken cancellationToken = default);
}

public class TerminalService(
    IRepository<PosTerminal> terminalRepository,
    IRepository<Branch> branchRepository,
    IRepository<Payment> paymentRepository,
    IPosGateway posGateway,
    ICurrentUserService currentUserService,
    IAuditLogService auditLogService,
    IUnitOfWork unitOfWork) : ITerminalService
{
    public async Task<List<PosTerminalDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var terminals = await terminalRepository.Query()
            .AsNoTracking()
            .OrderBy(x => x.TerminalNo)
            .ToListAsync(cancellationToken);

        return await MapWithMetricsAsync(terminals, cancellationToken);
    }

    public async Task<PosTerminalDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var terminal = await terminalRepository.Query()
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Terminal not found.");

        return (await MapWithMetricsAsync([terminal], cancellationToken)).Single();
    }

    public async Task<List<PosTerminalDto>> GetByBranchIdAsync(int branchId, CancellationToken cancellationToken = default)
    {
        var terminals = await terminalRepository.Query()
            .AsNoTracking()
            .Where(x => x.BranchId == branchId)
            .OrderBy(x => x.TerminalNo)
            .ToListAsync(cancellationToken);

        return await MapWithMetricsAsync(terminals, cancellationToken);
    }

    public async Task<PosTerminalDto> CreateAsync(UpsertPosTerminalRequest request, CancellationToken cancellationToken = default)
    {
        await EnsureBranchExistsAsync(request.BranchId, cancellationToken);
        await EnsureUniqueAsync(request.BranchId, request.TerminalNo, null, cancellationToken);

        if (request.IsDefault)
        {
            await ResetDefaultAsync(request.BranchId, cancellationToken);
        }

        var terminal = new PosTerminal
        {
            BranchId = request.BranchId,
            TerminalNo = request.TerminalNo,
            DeviceName = request.DeviceName,
            CashRegisterName = request.CashRegisterName,
            IsDefault = request.IsDefault,
            IsActive = request.IsActive,
            IpAddress = request.IpAddress,
            Model = request.Model,
            FirmwareVersion = request.FirmwareVersion,
            Status = PosTerminalStatus.Cevrimdisi
        };

        await terminalRepository.AddAsync(terminal, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        await auditLogService.CreateAsync(currentUserService.UserId, "Create", nameof(PosTerminal), terminal.Id.ToString(), $"Terminal {terminal.TerminalNo} created.", currentUserService.IpAddress, cancellationToken);
        return await GetByIdAsync(terminal.Id, cancellationToken);
    }

    public async Task<PosTerminalDto> UpdateAsync(int id, UpsertPosTerminalRequest request, CancellationToken cancellationToken = default)
    {
        var terminal = await terminalRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Terminal not found.");

        await EnsureBranchExistsAsync(request.BranchId, cancellationToken);
        await EnsureUniqueAsync(request.BranchId, request.TerminalNo, id, cancellationToken);

        if (request.IsDefault && !terminal.IsDefault)
        {
            await ResetDefaultAsync(request.BranchId, cancellationToken);
        }

        terminal.BranchId = request.BranchId;
        terminal.TerminalNo = request.TerminalNo;
        terminal.DeviceName = request.DeviceName;
        terminal.CashRegisterName = request.CashRegisterName;
        terminal.IsDefault = request.IsDefault;
        terminal.IsActive = request.IsActive;
        terminal.IpAddress = request.IpAddress;
        terminal.Model = request.Model;
        terminal.FirmwareVersion = request.FirmwareVersion;
        terminalRepository.Update(terminal);

        await unitOfWork.SaveChangesAsync(cancellationToken);
        await auditLogService.CreateAsync(currentUserService.UserId, "Update", nameof(PosTerminal), terminal.Id.ToString(), $"Terminal {terminal.TerminalNo} updated.", currentUserService.IpAddress, cancellationToken);
        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var terminal = await terminalRepository.Query()
            .Include(x => x.Payments)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Terminal not found.");

        if (terminal.Payments.Any())
        {
            terminal.IsActive = false;
            terminal.Status = PosTerminalStatus.Cevrimdisi;
            terminalRepository.Update(terminal);
        }
        else
        {
            terminalRepository.Remove(terminal);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);
        await auditLogService.CreateAsync(currentUserService.UserId, "Delete", nameof(PosTerminal), terminal.Id.ToString(), $"Terminal {terminal.TerminalNo} deleted/deactivated.", currentUserService.IpAddress, cancellationToken);
    }

    public async Task<PosTerminalDto> SetDefaultAsync(int id, CancellationToken cancellationToken = default)
    {
        var terminal = await terminalRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Terminal not found.");

        await ResetDefaultAsync(terminal.BranchId, cancellationToken);
        terminal.IsDefault = true;
        terminalRepository.Update(terminal);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        await auditLogService.CreateAsync(currentUserService.UserId, "Update", nameof(PosTerminal), terminal.Id.ToString(), $"Terminal {terminal.TerminalNo} set as default.", currentUserService.IpAddress, cancellationToken);
        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<PosTerminalDto> UpdateStatusAsync(int id, UpdateTerminalStatusRequest request, CancellationToken cancellationToken = default)
    {
        var terminal = await terminalRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Terminal not found.");

        terminal.Status = request.Status;
        terminal.LastConnectionAt = DateTime.UtcNow;
        terminalRepository.Update(terminal);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        await auditLogService.CreateAsync(currentUserService.UserId, "Update", nameof(PosTerminal), terminal.Id.ToString(), $"Terminal {terminal.TerminalNo} status updated to {request.Status}.", currentUserService.IpAddress, cancellationToken);
        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<TerminalTestConnectionDto> TestConnectionAsync(int id, CancellationToken cancellationToken = default)
    {
        var terminal = await terminalRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Terminal not found.");

        var result = await posGateway.TestConnectionAsync(terminal, cancellationToken);
        terminal.Status = result.TerminalStatus;
        terminal.LastConnectionAt = DateTime.UtcNow;
        terminalRepository.Update(terminal);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        await auditLogService.CreateAsync(currentUserService.UserId, "TestConnection", nameof(PosTerminal), terminal.Id.ToString(), $"Terminal {terminal.TerminalNo} test connection executed.", currentUserService.IpAddress, cancellationToken);

        return new TerminalTestConnectionDto
        {
            Success = result.IsSuccess,
            Message = result.ErrorMessage ?? "Terminal reachable.",
            TestedAt = DateTime.UtcNow,
            Status = result.TerminalStatus
        };
    }

    private async Task EnsureBranchExistsAsync(int branchId, CancellationToken cancellationToken)
    {
        var exists = await branchRepository.AnyAsync(x => x.Id == branchId, cancellationToken);
        if (!exists)
        {
            throw new BadRequestException("Branch not found.");
        }
    }

    private async Task EnsureUniqueAsync(int branchId, string terminalNo, int? currentId, CancellationToken cancellationToken)
    {
        var exists = await terminalRepository.Query()
            .AnyAsync(x => x.BranchId == branchId && x.TerminalNo == terminalNo && (!currentId.HasValue || x.Id != currentId.Value), cancellationToken);
        if (exists)
        {
            throw new ConflictException("Terminal number already exists in the branch.");
        }
    }

    private async Task ResetDefaultAsync(int branchId, CancellationToken cancellationToken)
    {
        var defaults = await terminalRepository.Query()
            .Where(x => x.BranchId == branchId && x.IsDefault)
            .ToListAsync(cancellationToken);

        foreach (var terminal in defaults)
        {
            terminal.IsDefault = false;
            terminalRepository.Update(terminal);
        }
    }

    private async Task<List<PosTerminalDto>> MapWithMetricsAsync(List<PosTerminal> terminals, CancellationToken cancellationToken)
    {
        var terminalIds = terminals.Select(x => x.Id).ToList();
        var today = DateTime.UtcNow.Date;
        var terminalPayments = await paymentRepository.Query()
            .AsNoTracking()
            .Where(x => x.TerminalId.HasValue && terminalIds.Contains(x.TerminalId.Value))
            .ToListAsync(cancellationToken);

        return terminals.Select(terminal =>
        {
            var payments = terminalPayments.Where(x => x.TerminalId == terminal.Id).ToList();
            var todayPayments = payments.Where(x => (x.CompletedAt ?? x.CreatedAt).Date == today).ToList();
            var successfulCount = payments.Count(x => x.Status == PaymentStatus.Basarili);
            var processedCount = payments.Count(x => x.Status is PaymentStatus.Basarili or PaymentStatus.Basarisiz);

            return new PosTerminalDto
            {
                Id = terminal.Id,
                BranchId = terminal.BranchId,
                TerminalNo = terminal.TerminalNo,
                DeviceName = terminal.DeviceName,
                CashRegisterName = terminal.CashRegisterName,
                Status = terminal.Status,
                LastConnectionAt = terminal.LastConnectionAt,
                LastSuccessfulTransactionAt = terminal.LastSuccessfulTransactionAt,
                IsDefault = terminal.IsDefault,
                IsActive = terminal.IsActive,
                IpAddress = terminal.IpAddress,
                Model = terminal.Model,
                FirmwareVersion = terminal.FirmwareVersion,
                SuccessRate = processedCount == 0 ? 0 : Math.Round(successfulCount * 100m / processedCount, 2),
                TotalTransactionsToday = todayPayments.Count,
                TotalAmountToday = todayPayments.Where(x => x.Status == PaymentStatus.Basarili).Sum(x => x.Amount)
            };
        }).ToList();
    }
}
