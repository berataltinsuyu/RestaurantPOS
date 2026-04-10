using System.Security.Claims;

namespace Backend.Helpers;

public interface ICurrentUserService
{
    int? UserId { get; }
    string? UserName { get; }
    string? RoleName { get; }
    int? BranchId { get; }
    string? IpAddress { get; }
}

public class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{
    private readonly HttpContext? _httpContext = httpContextAccessor.HttpContext;

    public int? UserId
    {
        get
        {
            var claimValue = _httpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(claimValue, out var userId) ? userId : null;
        }
    }

    public string? UserName => _httpContext?.User.FindFirstValue(ClaimTypes.Name);

    public string? RoleName => _httpContext?.User.FindFirstValue(ClaimTypes.Role);

    public int? BranchId
    {
        get
        {
            var claimValue = _httpContext?.User.FindFirstValue("branchId");
            return int.TryParse(claimValue, out var branchId) ? branchId : null;
        }
    }

    public string? IpAddress => _httpContext?.Connection.RemoteIpAddress?.ToString();
}
