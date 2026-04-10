using Backend.Enums;

namespace Backend.Entities;

public abstract class EntityBase
{
    public int Id { get; set; }
}

public abstract class CreatedEntityBase : EntityBase
{
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Role : EntityBase
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}

public class Permission : EntityBase
{
    public PermissionCode Code { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsCritical { get; set; }

    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}

public class RolePermission : EntityBase
{
    public int RoleId { get; set; }
    public int PermissionId { get; set; }
    public bool IsEnabled { get; set; }

    public Role? Role { get; set; }
    public Permission? Permission { get; set; }
}

public class User : CreatedEntityBase
{
    public string FullName { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public int RoleId { get; set; }
    public int? BranchId { get; set; }

    public Role? Role { get; set; }
    public Branch? Branch { get; set; }
    public ICollection<RestaurantTable> AssignedTables { get; set; } = new List<RestaurantTable>();
    public ICollection<Bill> Bills { get; set; } = new List<Bill>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    public ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
    public ICollection<Shift> Shifts { get; set; } = new List<Shift>();
}
