using Backend.Enums;

namespace Backend.DTOs;

public class BillItemDto
{
    public int Id { get; set; }
    public int BillId { get; set; }
    public int ProductId { get; set; }
    public string ProductNameSnapshot { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public decimal VatRate { get; set; }
    public int Quantity { get; set; }
    public decimal LineTotal { get; set; }
    public string? Note { get; set; }
    public BillItemStatus Status { get; set; }
}

public class BillSummaryDto
{
    public int Id { get; set; }
    public int BranchId { get; set; }
    public int TableId { get; set; }
    public string TableNo { get; set; } = string.Empty;
    public string BillNo { get; set; } = string.Empty;
    public int WaiterId { get; set; }
    public string WaiterName { get; set; } = string.Empty;
    public BillStatus Status { get; set; }
    public int CustomerCount { get; set; }
    public string? Note { get; set; }
    public DateTime OpenedAt { get; set; }
    public DateTime? ClosedAt { get; set; }
    public decimal Subtotal { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal ServiceCharge { get; set; }
    public decimal VatAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal RemainingAmount { get; set; }
    public List<BillItemDto> Items { get; set; } = [];
}

public class CreateBillRequest
{
    public int BranchId { get; set; }
    public int TableId { get; set; }
    public int WaiterId { get; set; }
    public int CustomerCount { get; set; }
    public string? Note { get; set; }
}

public class UpdateBillRequest
{
    public int CustomerCount { get; set; }
    public string? Note { get; set; }
}

public class ApplyDiscountRequest
{
    public decimal Amount { get; set; }
    public string? Reason { get; set; }
}

public class UpdateServiceChargeRequest
{
    public decimal Rate { get; set; }
}

public class AddBillItemRequest
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public string? Note { get; set; }
}

public class UpdateBillItemRequest
{
    public int Quantity { get; set; }
    public string? Note { get; set; }
}

public class UpdateBillItemStatusRequest
{
    public BillItemStatus Status { get; set; }
    public string? Reason { get; set; }
}

public class ComplimentaryApprovalRequest
{
    public List<int> BillItemIds { get; set; } = [];
    public string Reason { get; set; } = string.Empty;
    public string ApproverName { get; set; } = string.Empty;
}
