namespace Backend.DTOs;

public class DashboardSummaryDto
{
    public string BranchName { get; set; } = string.Empty;
    public string BranchCode { get; set; } = string.Empty;
    public int ActiveTables { get; set; }
    public int ActiveOrders { get; set; }
    public int PendingPayments { get; set; }
    public decimal TotalRevenue { get; set; }
    public int ConnectedTerminals { get; set; }
    public int OfflineTerminals { get; set; }
}

public class DailyRevenueDto
{
    public DateTime Date { get; set; }
    public decimal CardAmount { get; set; }
    public decimal CashAmount { get; set; }
    public decimal SplitAmount { get; set; }
    public decimal TotalAmount { get; set; }
}

public class PaymentDistributionDto
{
    public string PaymentType { get; set; } = string.Empty;
    public int TransactionCount { get; set; }
    public decimal Amount { get; set; }
    public decimal Percentage { get; set; }
}

public class TablePerformanceDto
{
    public int TableId { get; set; }
    public string TableNo { get; set; } = string.Empty;
    public int TransactionCount { get; set; }
    public decimal Revenue { get; set; }
}

public class TerminalPerformanceDto
{
    public int TerminalId { get; set; }
    public string TerminalNo { get; set; } = string.Empty;
    public string DeviceName { get; set; } = string.Empty;
    public int TransactionCount { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal SuccessRate { get; set; }
    public string HealthStatus { get; set; } = string.Empty;
}

public class FailedTransactionDto
{
    public int PaymentId { get; set; }
    public string BillNo { get; set; } = string.Empty;
    public string TableNo { get; set; } = string.Empty;
    public string? TerminalNo { get; set; }
    public decimal Amount { get; set; }
    public string ErrorCode { get; set; } = string.Empty;
    public string ErrorMessage { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
