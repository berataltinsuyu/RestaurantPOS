using Backend.Enums;

namespace Backend.Entities;

public class Bill : EntityBase
{
    public int BranchId { get; set; }
    public int TableId { get; set; }
    public string BillNo { get; set; } = string.Empty;
    public int WaiterId { get; set; }
    public BillStatus Status { get; set; } = BillStatus.Acik;
    public int CustomerCount { get; set; }
    public string? Note { get; set; }
    public DateTime OpenedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ClosedAt { get; set; }
    public decimal Subtotal { get; set; }
    public decimal ManualDiscountAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal ServiceChargeRate { get; set; } = 0.10m;
    public decimal ServiceCharge { get; set; }
    public decimal VatAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal RemainingAmount { get; set; }

    public Branch? Branch { get; set; }
    public RestaurantTable? Table { get; set; }
    public User? Waiter { get; set; }
    public ICollection<BillItem> Items { get; set; } = new List<BillItem>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}

public class BillItem : EntityBase
{
    public int BillId { get; set; }
    public int ProductId { get; set; }
    public string ProductNameSnapshot { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public decimal VatRate { get; set; }
    public int Quantity { get; set; }
    public decimal LineTotal { get; set; }
    public string? Note { get; set; }
    public BillItemStatus Status { get; set; } = BillItemStatus.Hazirlaniyor;

    public Bill? Bill { get; set; }
    public Product? Product { get; set; }
}

public class PosTerminal : EntityBase
{
    public int BranchId { get; set; }
    public string TerminalNo { get; set; } = string.Empty;
    public string DeviceName { get; set; } = string.Empty;
    public string CashRegisterName { get; set; } = string.Empty;
    public PosTerminalStatus Status { get; set; } = PosTerminalStatus.Cevrimdisi;
    public DateTime? LastConnectionAt { get; set; }
    public DateTime? LastSuccessfulTransactionAt { get; set; }
    public bool IsDefault { get; set; }
    public bool IsActive { get; set; } = true;
    public string? IpAddress { get; set; }
    public string? Model { get; set; }
    public string? FirmwareVersion { get; set; }

    public Branch? Branch { get; set; }
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}

public class Payment : CreatedEntityBase
{
    public int BillId { get; set; }
    public int? TerminalId { get; set; }
    public PaymentType PaymentType { get; set; }
    public decimal Amount { get; set; }
    public PaymentStatus Status { get; set; } = PaymentStatus.Bekliyor;
    public string ReferenceNo { get; set; } = string.Empty;
    public string? BankApprovalCode { get; set; }
    public string? CardMaskedPan { get; set; }
    public string? ErrorCode { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int CreatedByUserId { get; set; }
    public int? OriginalPaymentId { get; set; }
    public string? SplitPaymentGroupId { get; set; }
    public string? Notes { get; set; }
    public string? RefundReason { get; set; }

    public Bill? Bill { get; set; }
    public PosTerminal? Terminal { get; set; }
    public User? CreatedByUser { get; set; }
    public Payment? OriginalPayment { get; set; }
    public ICollection<Payment> RefundPayments { get; set; } = new List<Payment>();
}

public class AuditLog : CreatedEntityBase
{
    public int? UserId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string EntityName { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? IpAddress { get; set; }

    public User? User { get; set; }
}

public class Shift : EntityBase
{
    public int BranchId { get; set; }
    public int UserId { get; set; }
    public decimal OpeningCashAmount { get; set; }
    public decimal? ClosingCashAmount { get; set; }
    public DateTime OpenedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ClosedAt { get; set; }
    public ShiftStatus Status { get; set; } = ShiftStatus.Acik;
    public string? Note { get; set; }

    public Branch? Branch { get; set; }
    public User? User { get; set; }
}
