using Backend.Enums;

namespace Backend.DTOs;

public class PermissionToggleDto
{
    public int PermissionId { get; set; }
    public PermissionCode Code { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsCritical { get; set; }
    public bool IsEnabled { get; set; }
}

public class RolePermissionMatrixDto
{
    public int RoleId { get; set; }
    public string RoleName { get; set; } = string.Empty;
    public int UserCount { get; set; }
    public List<PermissionToggleDto> Permissions { get; set; } = [];
}

public class RolePermissionUpdateItemDto
{
    public int PermissionId { get; set; }
    public bool IsEnabled { get; set; }
}

public class UpdateRolePermissionsRequest
{
    public List<RolePermissionUpdateItemDto> Permissions { get; set; } = [];
}
