namespace Backend.Entities;

public class PrinterSetting : EntityBase
{
    public int BranchId { get; set; }
    public string PrinterName { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
    public bool AutoPrintReceipt { get; set; }
    public bool PrintKitchenCopy { get; set; }
    public bool PrintLogo { get; set; }
    public bool IsActive { get; set; } = true;

    public Branch? Branch { get; set; }
}

public class AppSetting : EntityBase
{
    public int BranchId { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string Group { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;

    public Branch? Branch { get; set; }
}
