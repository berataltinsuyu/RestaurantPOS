using Backend.DTOs;
using Backend.Entities;
using Backend.Helpers;
using Backend.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public interface IUserService
{
    Task<List<UserSummaryDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<UserSummaryDto> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<UserSummaryDto> CreateAsync(CreateUserRequest request, CancellationToken cancellationToken = default);
    Task<UserSummaryDto> UpdateAsync(int id, UpdateUserRequest request, CancellationToken cancellationToken = default);
    Task DeleteAsync(int id, CancellationToken cancellationToken = default);
}

public class UserService(
    IRepository<User> userRepository,
    IRepository<Role> roleRepository,
    IRepository<Branch> branchRepository,
    IPasswordHasherService passwordHasherService,
    ICurrentUserService currentUserService,
    IAuditLogService auditLogService,
    IUnitOfWork unitOfWork) : IUserService
{
    public async Task<List<UserSummaryDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var users = await userRepository.Query()
            .AsNoTracking()
            .Include(x => x.Role)
            .Include(x => x.Branch)
            .OrderBy(x => x.FullName)
            .ToListAsync(cancellationToken);

        return users.Select(MapUser).ToList();
    }

    public async Task<UserSummaryDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var user = await userRepository.Query()
            .AsNoTracking()
            .Include(x => x.Role)
            .Include(x => x.Branch)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("User not found.");

        return MapUser(user);
    }

    public async Task<UserSummaryDto> CreateAsync(CreateUserRequest request, CancellationToken cancellationToken = default)
    {
        await ValidateRoleAndBranchAsync(request.RoleId, request.BranchId, cancellationToken);
        await EnsureUniqueAsync(request.UserName, request.Email, null, cancellationToken);

        var user = new User
        {
            FullName = request.FullName,
            UserName = request.UserName,
            Email = request.Email,
            IsActive = request.IsActive,
            RoleId = request.RoleId,
            BranchId = request.BranchId
        };
        user.PasswordHash = passwordHasherService.HashPassword(user, request.Password);

        await userRepository.AddAsync(user, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var created = await userRepository.Query()
            .AsNoTracking()
            .Include(x => x.Role)
            .Include(x => x.Branch)
            .FirstAsync(x => x.Id == user.Id, cancellationToken);

        await auditLogService.CreateAsync(currentUserService.UserId, "Create", nameof(User), user.Id.ToString(), $"User {user.UserName} created.", currentUserService.IpAddress, cancellationToken);
        return MapUser(created);
    }

    public async Task<UserSummaryDto> UpdateAsync(int id, UpdateUserRequest request, CancellationToken cancellationToken = default)
    {
        var user = await userRepository.Query()
            .Include(x => x.Role)
            .Include(x => x.Branch)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("User not found.");

        await ValidateRoleAndBranchAsync(request.RoleId, request.BranchId, cancellationToken);
        await EnsureUniqueAsync(request.UserName, request.Email, id, cancellationToken);

        user.FullName = request.FullName;
        user.UserName = request.UserName;
        user.Email = request.Email;
        user.IsActive = request.IsActive;
        user.RoleId = request.RoleId;
        user.BranchId = request.BranchId;

        if (!string.IsNullOrWhiteSpace(request.Password))
        {
            user.PasswordHash = passwordHasherService.HashPassword(user, request.Password);
        }

        userRepository.Update(user);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        await auditLogService.CreateAsync(currentUserService.UserId, "Update", nameof(User), user.Id.ToString(), $"User {user.UserName} updated.", currentUserService.IpAddress, cancellationToken);
        return await GetByIdAsync(user.Id, cancellationToken);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var user = await userRepository.Query()
            .Include(x => x.Payments)
            .Include(x => x.Shifts)
            .Include(x => x.Bills)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("User not found.");

        if (user.Payments.Any() || user.Shifts.Any() || user.Bills.Any())
        {
            user.IsActive = false;
            userRepository.Update(user);
        }
        else
        {
            userRepository.Remove(user);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);
        await auditLogService.CreateAsync(currentUserService.UserId, "Delete", nameof(User), user.Id.ToString(), $"User {user.UserName} deleted/deactivated.", currentUserService.IpAddress, cancellationToken);
    }

    public static UserSummaryDto MapUser(User user) => new()
    {
        Id = user.Id,
        FullName = user.FullName,
        UserName = user.UserName,
        Email = user.Email,
        IsActive = user.IsActive,
        RoleId = user.RoleId,
        RoleName = user.Role?.Name ?? string.Empty,
        BranchId = user.BranchId,
        BranchName = user.Branch?.Name,
        CreatedAt = user.CreatedAt
    };

    private async Task ValidateRoleAndBranchAsync(int roleId, int? branchId, CancellationToken cancellationToken)
    {
        var roleExists = await roleRepository.AnyAsync(x => x.Id == roleId, cancellationToken);
        if (!roleExists)
        {
            throw new BadRequestException("Role not found.");
        }

        if (branchId.HasValue)
        {
            var branchExists = await branchRepository.AnyAsync(x => x.Id == branchId.Value, cancellationToken);
            if (!branchExists)
            {
                throw new BadRequestException("Branch not found.");
            }
        }
    }

    private async Task EnsureUniqueAsync(string userName, string email, int? currentId, CancellationToken cancellationToken)
    {
        var userNameExists = await userRepository.Query().AnyAsync(x => x.UserName == userName && (!currentId.HasValue || x.Id != currentId.Value), cancellationToken);
        if (userNameExists)
        {
            throw new ConflictException("Username already exists.");
        }

        var emailExists = await userRepository.Query().AnyAsync(x => x.Email == email && (!currentId.HasValue || x.Id != currentId.Value), cancellationToken);
        if (emailExists)
        {
            throw new ConflictException("Email already exists.");
        }
    }
}
