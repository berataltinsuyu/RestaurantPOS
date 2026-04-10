using Backend.Enums;

namespace Backend.DTOs;

public class ReservationInfoDto
{
    public int Id { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public int GuestCount { get; set; }
    public DateTime ReservationAt { get; set; }
    public string? Notes { get; set; }
    public ReservationStatus Status { get; set; }
}

public class TableSummaryDto
{
    public int Id { get; set; }
    public int BranchId { get; set; }
    public string TableNo { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public RestaurantTableStatus Status { get; set; }
    public int? WaiterId { get; set; }
    public string? WaiterName { get; set; }
    public int? CurrentBillId { get; set; }
    public bool IsMerged { get; set; }
    public string AreaName { get; set; } = string.Empty;
    public int CurrentGuestCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public decimal CurrentTotal { get; set; }
    public ReservationInfoDto? ActiveReservation { get; set; }
}

public class CreateTableRequest
{
    public int BranchId { get; set; }
    public string TableNo { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public string AreaName { get; set; } = "İç Salon";
    public bool IsMerged { get; set; }
}

public class UpdateTableRequest
{
    public string TableNo { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public string AreaName { get; set; } = "İç Salon";
    public bool IsMerged { get; set; }
}

public class UpdateTableStatusRequest
{
    public RestaurantTableStatus Status { get; set; }
}

public class AssignWaiterRequest
{
    public int WaiterId { get; set; }
    public string? Reason { get; set; }
}

public class OpenTableRequest
{
    public int WaiterId { get; set; }
    public int GuestCount { get; set; }
    public string? Note { get; set; }
}

public class MoveTableRequest
{
    public int TargetTableId { get; set; }
}

public class MergeTablesRequest
{
    public List<int> TargetTableIds { get; set; } = [];
    public string? MergedName { get; set; }
}

public class SplitTableRequest
{
    public string NewTableNo { get; set; } = string.Empty;
    public List<int> BillItemIds { get; set; } = [];
    public string AreaName { get; set; } = "İç Salon";
}

public class ReservationRequest
{
    public string CustomerName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public int GuestCount { get; set; }
    public DateTime ReservationAt { get; set; }
    public string? Notes { get; set; }
}
