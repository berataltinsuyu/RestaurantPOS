using Backend.DTOs;
using Backend.Entities;
using Backend.Helpers;
using Backend.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
    Task<LoginResponse> GetCurrentSessionAsync(CancellationToken cancellationToken = default);
}

public class AuthService(
    IRepository<User> userRepository,
    IRepository<Branch> branchRepository,
    ICurrentUserService currentUserService,
    IPasswordHasherService passwordHasherService,
    IJwtTokenGenerator jwtTokenGenerator) : IAuthService
{
    public async Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var user = await userRepository.Query()
            .Include(x => x.Role)
            .ThenInclude(x => x!.RolePermissions)
            .ThenInclude(x => x.Permission)
            .Include(x => x.Branch)
            .FirstOrDefaultAsync(x => x.UserName == request.UserName, cancellationToken)
            ?? throw new UnauthorizedAppException("Invalid username or password.");

        if (!user.IsActive)
        {
            throw new UnauthorizedAppException("User is inactive.");
        }

        if (!passwordHasherService.VerifyPassword(user, request.Password))
        {
            throw new UnauthorizedAppException("Invalid username or password.");
        }

        Branch branch;
        if (request.BranchId.HasValue)
        {
            branch = await branchRepository.Query()
                .FirstOrDefaultAsync(x => x.Id == request.BranchId.Value && x.IsActive, cancellationToken)
                ?? throw new UnauthorizedAppException("Branch not found.");
        }
        else
        {
            branch = await branchRepository.Query()
                .FirstOrDefaultAsync(x => x.Code == request.BranchCode && x.IsActive, cancellationToken)
                ?? throw new UnauthorizedAppException("Branch not found.");
        }

        if (user.BranchId.HasValue && user.BranchId.Value != branch.Id && user.Role?.Name != RoleNames.SystemAdministrator)
        {
            throw new UnauthorizedAppException("User does not belong to the selected branch.");
        }

        var permissions = user.Role?.RolePermissions
            .Where(x => x.IsEnabled)
            .Select(x => x.Permission!.Code.ToString())
            .Distinct()
            .OrderBy(x => x)
            .ToList() ?? [];

        var (token, expiresAt) = jwtTokenGenerator.GenerateToken(user, branch, permissions);

        return new LoginResponse
        {
            Token = token,
            ExpiresAt = expiresAt,
            User = UserService.MapUser(user),
            Branch = BranchService.MapBranch(branch),
            Permissions = permissions
        };
    }

    public async Task<LoginResponse> GetCurrentSessionAsync(CancellationToken cancellationToken = default)
    {
        var userId = currentUserService.UserId ?? throw new UnauthorizedAppException("Oturum doğrulanamadı.");

        var user = await userRepository.Query()
            .Include(x => x.Role)
            .ThenInclude(x => x!.RolePermissions)
            .ThenInclude(x => x.Permission)
            .Include(x => x.Branch)
            .FirstOrDefaultAsync(x => x.Id == userId, cancellationToken)
            ?? throw new UnauthorizedAppException("Kullanıcı bulunamadı.");

        if (!user.IsActive)
        {
            throw new UnauthorizedAppException("User is inactive.");
        }

        var branch = await ResolveSessionBranchAsync(user, cancellationToken);
        var permissions = user.Role?.RolePermissions
            .Where(x => x.IsEnabled)
            .Select(x => x.Permission!.Code.ToString())
            .Distinct()
            .OrderBy(x => x)
            .ToList() ?? [];

        var (token, expiresAt) = jwtTokenGenerator.GenerateToken(user, branch, permissions);

        return new LoginResponse
        {
            Token = token,
            ExpiresAt = expiresAt,
            User = UserService.MapUser(user),
            Branch = BranchService.MapBranch(branch),
            Permissions = permissions
        };
    }

    private async Task<Branch> ResolveSessionBranchAsync(User user, CancellationToken cancellationToken)
    {
        if (currentUserService.BranchId.HasValue)
        {
            var selectedBranch = await branchRepository.Query()
                .FirstOrDefaultAsync(branch => branch.Id == currentUserService.BranchId.Value && branch.IsActive, cancellationToken);

            if (selectedBranch is not null)
            {
                return selectedBranch;
            }
        }

        if (user.Branch is { IsActive: true })
        {
            return user.Branch;
        }

        return await branchRepository.Query()
            .FirstOrDefaultAsync(branch => branch.IsActive, cancellationToken)
            ?? throw new UnauthorizedAppException("Branch not found.");
    }
}
