namespace Backend.Helpers;

public interface IReferenceGenerator
{
    string CreateBillNumber();
    string CreatePaymentReference();
    string CreateApprovalCode();
    string CreateSplitGroupId();
}

public class ReferenceGenerator : IReferenceGenerator
{
    public string CreateBillNumber() => $"A-{DateTime.UtcNow:yyMMdd}-{Random.Shared.Next(1000, 9999)}";

    public string CreatePaymentReference() => $"REF-{DateTime.UtcNow:yyyyMMddHHmmss}{Random.Shared.Next(100, 999)}";

    public string CreateApprovalCode() => Random.Shared.Next(100000, 999999).ToString();

    public string CreateSplitGroupId() => $"SPL-{Guid.NewGuid():N}".ToUpperInvariant();
}
