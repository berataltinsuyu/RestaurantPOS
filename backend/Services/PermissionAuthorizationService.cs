using Backend.Entities;
using Backend.Enums;
using Backend.Helpers;
using Backend.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public interface IPermissionAuthorizationService
{
    Task EnsurePermissionAsync(PermissionCode permissionCode, string? message = null, CancellationToken cancellationToken = default);
}

public class PermissionAuthorizationService(
    IRepository<User> userRepository,
    ICurrentUserService currentUserService) : IPermissionAuthorizationService
{
    public async Task EnsurePermissionAsync(PermissionCode permissionCode, string? message = null, CancellationToken cancellationToken = default)
    {
        var userId = currentUserService.UserId ?? throw new UnauthorizedAppException("Oturum doğrulanamadı.");

        var hasPermission = await userRepository.Query()
            .AsNoTracking()
            .Where(user => user.Id == userId && user.IsActive)
            .SelectMany(user => user.Role!.RolePermissions)
            .AnyAsync(rolePermission =>
                rolePermission.IsEnabled &&
                rolePermission.Permission != null &&
                rolePermission.Permission.Code == permissionCode,
                cancellationToken);

        if (!hasPermission)
        {
            throw new ForbiddenAppException(message ?? "Bu işlem için yetkiniz bulunmuyor.");
        }
    }
}
