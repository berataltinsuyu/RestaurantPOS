using Backend.Enums;

namespace Backend.DTOs;

public class PosTerminalDto
{
    public int Id { get; set; }
    public int BranchId { get; set; }
    public string TerminalNo { get; set; } = string.Empty;
    public string DeviceName { get; set; } = string.Empty;
    public string CashRegisterName { get; set; } = string.Empty;
    public PosTerminalStatus Status { get; set; }
    public DateTime? LastConnectionAt { get; set; }
    public DateTime? LastSuccessfulTransactionAt { get; set; }
    public bool IsDefault { get; set; }
    public bool IsActive { get; set; }
    public string? IpAddress { get; set; }
    public string? Model { get; set; }
    public string? FirmwareVersion { get; set; }
    public decimal SuccessRate { get; set; }
    public int TotalTransactionsToday { get; set; }
    public decimal TotalAmountToday { get; set; }
}

public class UpsertPosTerminalRequest
{
    public int BranchId { get; set; }
    public string TerminalNo { get; set; } = string.Empty;
    public string DeviceName { get; set; } = string.Empty;
    public string CashRegisterName { get; set; } = string.Empty;
    public bool IsDefault { get; set; }
    public bool IsActive { get; set; } = true;
    public string? IpAddress { get; set; }
    public string? Model { get; set; }
    public string? FirmwareVersion { get; set; }
}

public class UpdateTerminalStatusRequest
{
    public PosTerminalStatus Status { get; set; }
}

public class TerminalTestConnectionDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public DateTime TestedAt { get; set; }
    public PosTerminalStatus Status { get; set; }
}

public class PaymentDto
{
    public int Id { get; set; }
    public int BillId { get; set; }
    public string BillNo { get; set; } = string.Empty;
    public int? TerminalId { get; set; }
    public string? TerminalNo { get; set; }
    public PaymentType PaymentType { get; set; }
    public decimal Amount { get; set; }
    public PaymentStatus Status { get; set; }
    public string ReferenceNo { get; set; } = string.Empty;
    public string? BankApprovalCode { get; set; }
    public string? CardMaskedPan { get; set; }
    public string? ErrorCode { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int CreatedByUserId { get; set; }
    public string CreatedByUserName { get; set; } = string.Empty;
    public int? OriginalPaymentId { get; set; }
    public string? SplitPaymentGroupId { get; set; }
}

public class CashPaymentRequest
{
    public int BillId { get; set; }
    public decimal Amount { get; set; }
}

public class CardPaymentRequest
{
    public int BillId { get; set; }
    public int TerminalId { get; set; }
    public decimal Amount { get; set; }
    public string? CardMaskedPan { get; set; }
}

public class SplitPaymentPartRequest
{
    public decimal Amount { get; set; }
    public PaymentType Method { get; set; }
    public int? TerminalId { get; set; }
    public string? CardMaskedPan { get; set; }
}

public class SplitPaymentRequest
{
    public int BillId { get; set; }
    public string Mode { get; set; } = "manual";
    public List<SplitPaymentPartRequest> Parts { get; set; } = [];
}

public class SplitPaymentResultDto
{
    public string GroupId { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal RemainingAmount { get; set; }
    public List<PaymentDto> Payments { get; set; } = [];
}

public class RefundPaymentRequest
{
    public int OriginalPaymentId { get; set; }
    public decimal Amount { get; set; }
    public int? TerminalId { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ApproverName { get; set; }
}

public class TransactionTimelineItemDto
{
    public string Label { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Detail { get; set; }
}

public class TransactionHistoryItemDto
{
    public int Id { get; set; }
    public DateTime TransactionDate { get; set; }
    public string TableNo { get; set; } = string.Empty;
    public string BillNo { get; set; } = string.Empty;
    public string TerminalNo { get; set; } = string.Empty;
    public string TransactionTypeLabel { get; set; } = string.Empty;
    public string PaymentTypeLabel { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string StatusLabel { get; set; } = string.Empty;
    public string? ReferenceNo { get; set; }
    public int? OriginalPaymentId { get; set; }
    public string? OriginalReferenceNo { get; set; }
    public string? RefundReason { get; set; }
}

public class TransactionDetailDto
{
    public int Id { get; set; }
    public string ReceiptNo { get; set; } = string.Empty;
    public string TableNo { get; set; } = string.Empty;
    public string Waiter { get; set; } = string.Empty;
    public string TerminalId { get; set; } = string.Empty;
    public string TerminalName { get; set; } = string.Empty;
    public string TransactionTypeLabel { get; set; } = string.Empty;
    public string PaymentType { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string? BankReference { get; set; }
    public string? OriginalReferenceNo { get; set; }
    public int? OriginalPaymentId { get; set; }
    public string? AuthCode { get; set; }
    public string? CardLastFour { get; set; }
    public DateTime TransactionDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? ErrorReason { get; set; }
    public string? Notes { get; set; }
    public string? RefundReason { get; set; }
    public List<BillItemDto> Items { get; set; } = [];
    public List<TransactionTimelineItemDto> Timeline { get; set; } = [];
}
