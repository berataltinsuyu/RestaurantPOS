namespace Backend.DTOs;

public class LoginRequest
{
    public int? BranchId { get; set; }
    public string? BranchCode { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public UserSummaryDto User { get; set; } = new();
    public BranchSummaryDto Branch { get; set; } = new();
    public List<string> Permissions { get; set; } = [];
}
