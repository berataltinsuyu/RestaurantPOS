using Backend.Enums;

namespace Backend.DTOs;

public class ShiftDto
{
    public int Id { get; set; }
    public int BranchId { get; set; }
    public string BranchName { get; set; } = string.Empty;
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public decimal OpeningCashAmount { get; set; }
    public decimal? ClosingCashAmount { get; set; }
    public DateTime OpenedAt { get; set; }
    public DateTime? ClosedAt { get; set; }
    public ShiftStatus Status { get; set; }
    public string? Note { get; set; }
}

public class OpenShiftRequest
{
    public int BranchId { get; set; }
    public decimal OpeningCashAmount { get; set; }
    public string? Note { get; set; }
}

public class CloseShiftRequest
{
    public decimal ClosingCashAmount { get; set; }
    public string? Note { get; set; }
}

public class PrinterSettingDto
{
    public int Id { get; set; }
    public int BranchId { get; set; }
    public string PrinterName { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
    public bool AutoPrintReceipt { get; set; }
    public bool PrintKitchenCopy { get; set; }
    public bool PrintLogo { get; set; }
    public bool IsActive { get; set; }
}

public class UpsertPrinterSettingRequest
{
    public int BranchId { get; set; }
    public string PrinterName { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
    public bool AutoPrintReceipt { get; set; }
    public bool PrintKitchenCopy { get; set; }
    public bool PrintLogo { get; set; }
    public bool IsActive { get; set; } = true;
}

public class AppSettingDto
{
    public int Id { get; set; }
    public int BranchId { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string Group { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; }
}

public class UpsertAppSettingRequest
{
    public int BranchId { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string Group { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
}
