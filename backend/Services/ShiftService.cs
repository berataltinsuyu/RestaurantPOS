using Backend.DTOs;
using Backend.Entities;
using Backend.Enums;
using Backend.Helpers;
using Backend.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public interface IShiftService
{
    Task<List<ShiftDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<ShiftDto> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<ShiftDto> OpenAsync(OpenShiftRequest request, CancellationToken cancellationToken = default);
    Task<ShiftDto> CloseAsync(int id, CloseShiftRequest request, CancellationToken cancellationToken = default);
}

public class ShiftService(
    IRepository<Shift> shiftRepository,
    IRepository<Branch> branchRepository,
    IRepository<User> userRepository,
    ICurrentUserService currentUserService,
    IAuditLogService auditLogService,
    IUnitOfWork unitOfWork) : IShiftService
{
    public async Task<List<ShiftDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var shifts = await shiftRepository.Query()
            .AsNoTracking()
            .Include(x => x.Branch)
            .Include(x => x.User)
            .OrderByDescending(x => x.OpenedAt)
            .ToListAsync(cancellationToken);

        return shifts.Select(Map).ToList();
    }

    public async Task<ShiftDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var shift = await shiftRepository.Query()
            .AsNoTracking()
            .Include(x => x.Branch)
            .Include(x => x.User)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Shift not found.");

        return Map(shift);
    }

    public async Task<ShiftDto> OpenAsync(OpenShiftRequest request, CancellationToken cancellationToken = default)
    {
        var userId = currentUserService.UserId ?? throw new UnauthorizedAppException("Current user could not be resolved.");

        var branchExists = await branchRepository.AnyAsync(x => x.Id == request.BranchId, cancellationToken);
        if (!branchExists)
        {
            throw new BadRequestException("Branch not found.");
        }

        var userExists = await userRepository.AnyAsync(x => x.Id == userId, cancellationToken);
        if (!userExists)
        {
            throw new BadRequestException("User not found.");
        }

        var openShiftExists = await shiftRepository.Query()
            .AnyAsync(x => x.UserId == userId && x.Status == ShiftStatus.Acik, cancellationToken);
        if (openShiftExists)
        {
            throw new ConflictException("User already has an open shift.");
        }

        var shift = new Shift
        {
            BranchId = request.BranchId,
            UserId = userId,
            OpeningCashAmount = request.OpeningCashAmount,
            Note = request.Note,
            Status = ShiftStatus.Acik
        };

        await shiftRepository.AddAsync(shift, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        await auditLogService.CreateAsync(userId, "OpenShift", nameof(Shift), shift.Id.ToString(), $"Shift {shift.Id} opened.", currentUserService.IpAddress, cancellationToken);
        return await GetByIdAsync(shift.Id, cancellationToken);
    }

    public async Task<ShiftDto> CloseAsync(int id, CloseShiftRequest request, CancellationToken cancellationToken = default)
    {
        var shift = await shiftRepository.Query()
            .Include(x => x.Branch)
            .Include(x => x.User)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Shift not found.");

        if (shift.Status == ShiftStatus.Kapandi)
        {
            throw new ConflictException("Shift is already closed.");
        }

        shift.ClosingCashAmount = request.ClosingCashAmount;
        shift.Note = string.IsNullOrWhiteSpace(request.Note) ? shift.Note : request.Note;
        shift.ClosedAt = DateTime.UtcNow;
        shift.Status = ShiftStatus.Kapandi;
        shiftRepository.Update(shift);

        await unitOfWork.SaveChangesAsync(cancellationToken);
        await auditLogService.CreateAsync(currentUserService.UserId, "CloseShift", nameof(Shift), shift.Id.ToString(), $"Shift {shift.Id} closed.", currentUserService.IpAddress, cancellationToken);
        return Map(shift);
    }

    private static ShiftDto Map(Shift shift) => new()
    {
        Id = shift.Id,
        BranchId = shift.BranchId,
        BranchName = shift.Branch?.Name ?? string.Empty,
        UserId = shift.UserId,
        UserName = shift.User?.FullName ?? string.Empty,
        OpeningCashAmount = shift.OpeningCashAmount,
        ClosingCashAmount = shift.ClosingCashAmount,
        OpenedAt = shift.OpenedAt,
        ClosedAt = shift.ClosedAt,
        Status = shift.Status,
        Note = shift.Note
    };
}
