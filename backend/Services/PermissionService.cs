using Backend.DTOs;
using Backend.Entities;
using Backend.Helpers;
using Backend.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public interface IPermissionService
{
    Task<List<RolePermissionMatrixDto>> GetRoleMatrixAsync(CancellationToken cancellationToken = default);
    Task<RolePermissionMatrixDto> GetRoleMatrixByRoleIdAsync(int roleId, CancellationToken cancellationToken = default);
    Task<RolePermissionMatrixDto> UpdateRolePermissionsAsync(int roleId, UpdateRolePermissionsRequest request, CancellationToken cancellationToken = default);
}

public class PermissionService(
    IRepository<Role> roleRepository,
    IRepository<RolePermission> rolePermissionRepository,
    ICurrentUserService currentUserService,
    IAuditLogService auditLogService,
    IUnitOfWork unitOfWork) : IPermissionService
{
    public async Task<List<RolePermissionMatrixDto>> GetRoleMatrixAsync(CancellationToken cancellationToken = default)
    {
        var roles = await roleRepository.Query()
            .AsNoTracking()
            .Include(x => x.Users)
            .Include(x => x.RolePermissions)
            .ThenInclude(x => x.Permission)
            .OrderBy(x => x.Name)
            .ToListAsync(cancellationToken);

        return roles.Select(Map).ToList();
    }

    public async Task<RolePermissionMatrixDto> GetRoleMatrixByRoleIdAsync(int roleId, CancellationToken cancellationToken = default)
    {
        var role = await roleRepository.Query()
            .AsNoTracking()
            .Include(x => x.Users)
            .Include(x => x.RolePermissions)
            .ThenInclude(x => x.Permission)
            .FirstOrDefaultAsync(x => x.Id == roleId, cancellationToken)
            ?? throw new NotFoundException("Role not found.");

        return Map(role);
    }

    public async Task<RolePermissionMatrixDto> UpdateRolePermissionsAsync(int roleId, UpdateRolePermissionsRequest request, CancellationToken cancellationToken = default)
    {
        var role = await roleRepository.Query()
            .Include(x => x.RolePermissions)
            .ThenInclude(x => x.Permission)
            .FirstOrDefaultAsync(x => x.Id == roleId, cancellationToken)
            ?? throw new NotFoundException("Role not found.");

        foreach (var permissionUpdate in request.Permissions)
        {
            var rolePermission = role.RolePermissions.FirstOrDefault(x => x.PermissionId == permissionUpdate.PermissionId)
                ?? throw new BadRequestException($"Permission {permissionUpdate.PermissionId} not found for role.");

            rolePermission.IsEnabled = permissionUpdate.IsEnabled;
            rolePermissionRepository.Update(rolePermission);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);
        await auditLogService.CreateAsync(currentUserService.UserId, "UpdatePermissions", nameof(Role), role.Id.ToString(), $"Permissions updated for role {role.Name}.", currentUserService.IpAddress, cancellationToken);
        return await GetRoleMatrixByRoleIdAsync(roleId, cancellationToken);
    }

    private static RolePermissionMatrixDto Map(Role role) => new()
    {
        RoleId = role.Id,
        RoleName = role.Name,
        UserCount = role.Users.Count,
        Permissions = role.RolePermissions
            .OrderBy(x => x.Permission!.Code)
            .Select(x => new PermissionToggleDto
            {
                PermissionId = x.PermissionId,
                Code = x.Permission!.Code,
                Name = x.Permission.Name,
                Description = x.Permission.Description,
                IsCritical = x.Permission.IsCritical,
                IsEnabled = x.IsEnabled
            }).ToList()
    };
}
