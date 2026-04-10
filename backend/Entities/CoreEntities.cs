using Backend.Enums;

namespace Backend.Entities;

public class Branch : CreatedEntityBase
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string TaxNumber { get; set; } = string.Empty;
    public string MerchantNumber { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<RestaurantTable> Tables { get; set; } = new List<RestaurantTable>();
    public ICollection<Bill> Bills { get; set; } = new List<Bill>();
    public ICollection<PosTerminal> PosTerminals { get; set; } = new List<PosTerminal>();
    public ICollection<Shift> Shifts { get; set; } = new List<Shift>();
    public ICollection<PrinterSetting> PrinterSettings { get; set; } = new List<PrinterSetting>();
    public ICollection<AppSetting> AppSettings { get; set; } = new List<AppSetting>();
}

public class RestaurantTable : CreatedEntityBase
{
    public int BranchId { get; set; }
    public string TableNo { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public RestaurantTableStatus Status { get; set; } = RestaurantTableStatus.Bos;
    public int? WaiterId { get; set; }
    public int? CurrentBillId { get; set; }
    public bool IsMerged { get; set; }
    public string AreaName { get; set; } = "İç Salon";
    public int CurrentGuestCount { get; set; }

    public Branch? Branch { get; set; }
    public User? Waiter { get; set; }
    public Bill? CurrentBill { get; set; }
    public ICollection<Bill> Bills { get; set; } = new List<Bill>();
    public ICollection<TableReservation> Reservations { get; set; } = new List<TableReservation>();
}

public class TableReservation : CreatedEntityBase
{
    public int RestaurantTableId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public int GuestCount { get; set; }
    public DateTime ReservationAt { get; set; }
    public string? Notes { get; set; }
    public ReservationStatus Status { get; set; } = ReservationStatus.Aktif;

    public RestaurantTable? RestaurantTable { get; set; }
}

public class ProductCategory : EntityBase
{
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    public ICollection<Product> Products { get; set; } = new List<Product>();
}

public class Product : CreatedEntityBase
{
    public int CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public decimal VatRate { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsMenuActive { get; set; } = true;
    public bool IsOutOfStock { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ProductCategory? Category { get; set; }
    public ICollection<BillItem> BillItems { get; set; } = new List<BillItem>();
}
