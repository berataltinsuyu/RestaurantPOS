using Backend.DTOs;
using Backend.Entities;
using Backend.Helpers;
using Backend.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public interface IBranchService
{
    Task<List<BranchSummaryDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<BranchSummaryDto> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<BranchSummaryDto> CreateAsync(UpsertBranchRequest request, CancellationToken cancellationToken = default);
    Task<BranchSummaryDto> UpdateAsync(int id, UpsertBranchRequest request, CancellationToken cancellationToken = default);
    Task DeleteAsync(int id, CancellationToken cancellationToken = default);
}

public class BranchService(
    IRepository<Branch> branchRepository,
    ICurrentUserService currentUserService,
    IAuditLogService auditLogService,
    IUnitOfWork unitOfWork) : IBranchService
{
    public async Task<List<BranchSummaryDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var branches = await branchRepository.Query()
            .AsNoTracking()
            .OrderBy(x => x.Name)
            .ToListAsync(cancellationToken);

        return branches.Select(MapBranch).ToList();
    }

    public async Task<BranchSummaryDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var branch = await branchRepository.Query()
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Branch not found.");

        return MapBranch(branch);
    }

    public async Task<BranchSummaryDto> CreateAsync(UpsertBranchRequest request, CancellationToken cancellationToken = default)
    {
        await EnsureUniqueAsync(request.Code, null, cancellationToken);

        var branch = new Branch
        {
            Name = request.Name,
            Code = request.Code,
            Address = request.Address,
            Phone = request.Phone,
            Email = request.Email,
            TaxNumber = request.TaxNumber,
            MerchantNumber = request.MerchantNumber,
            IsActive = request.IsActive
        };

        await branchRepository.AddAsync(branch, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        await auditLogService.CreateAsync(currentUserService.UserId, "Create", nameof(Branch), branch.Id.ToString(), $"Branch {branch.Name} created.", currentUserService.IpAddress, cancellationToken);
        return MapBranch(branch);
    }

    public async Task<BranchSummaryDto> UpdateAsync(int id, UpsertBranchRequest request, CancellationToken cancellationToken = default)
    {
        var branch = await branchRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Branch not found.");

        await EnsureUniqueAsync(request.Code, id, cancellationToken);

        branch.Name = request.Name;
        branch.Code = request.Code;
        branch.Address = request.Address;
        branch.Phone = request.Phone;
        branch.Email = request.Email;
        branch.TaxNumber = request.TaxNumber;
        branch.MerchantNumber = request.MerchantNumber;
        branch.IsActive = request.IsActive;

        branchRepository.Update(branch);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        await auditLogService.CreateAsync(currentUserService.UserId, "Update", nameof(Branch), branch.Id.ToString(), $"Branch {branch.Name} updated.", currentUserService.IpAddress, cancellationToken);
        return MapBranch(branch);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var branch = await branchRepository.Query()
            .Include(x => x.Bills)
            .Include(x => x.Tables)
            .Include(x => x.Users)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Branch not found.");

        if (branch.Bills.Any() || branch.Tables.Any() || branch.Users.Any())
        {
            branch.IsActive = false;
            branchRepository.Update(branch);
        }
        else
        {
            branchRepository.Remove(branch);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);
        await auditLogService.CreateAsync(currentUserService.UserId, "Delete", nameof(Branch), branch.Id.ToString(), $"Branch {branch.Name} deleted/deactivated.", currentUserService.IpAddress, cancellationToken);
    }

    public static BranchSummaryDto MapBranch(Branch branch) => new()
    {
        Id = branch.Id,
        Name = branch.Name,
        Code = branch.Code,
        Address = branch.Address,
        Phone = branch.Phone,
        Email = branch.Email,
        TaxNumber = branch.TaxNumber,
        MerchantNumber = branch.MerchantNumber,
        IsActive = branch.IsActive,
        CreatedAt = branch.CreatedAt
    };

    private async Task EnsureUniqueAsync(string code, int? currentId, CancellationToken cancellationToken)
    {
        var exists = await branchRepository.Query().AnyAsync(x => x.Code == code && (!currentId.HasValue || x.Id != currentId.Value), cancellationToken);
        if (exists)
        {
            throw new ConflictException("Branch code already exists.");
        }
    }
}
