namespace Backend.Enums;

public enum PermissionCode
{
    View = 1,
    Edit = 2,
    Discount = 3,
    Refund = 4,
    Cancel = 5,
    Reports = 6,
    Settings = 7,
    Terminal = 8,
    EndOfDay = 9,
    MenuManagement = 10
}

public enum RestaurantTableStatus
{
    Bos = 1,
    Dolu = 2,
    OdemeBekliyor = 3,
    Odendi = 4
}

public enum BillStatus
{
    Acik = 1,
    OdemeBekliyor = 2,
    Kapandi = 3,
    Iptal = 4
}

public enum BillItemStatus
{
    Hazirlaniyor = 1,
    ServisEdildi = 2,
    Iptal = 3,
    Ikram = 4
}

public enum PosTerminalStatus
{
    Bagli = 1,
    Islemde = 2,
    Cevrimdisi = 3,
    Mesgul = 4
}

public enum PaymentType
{
    Nakit = 1,
    Kart = 2,
    BolunmusOdeme = 3,
    Iade = 4
}

public enum PaymentStatus
{
    Bekliyor = 1,
    PosaGonderildi = 2,
    Basarili = 3,
    Basarisiz = 4,
    IptalEdildi = 5
}

public enum ShiftStatus
{
    Acik = 1,
    Kapandi = 2
}

public enum ReservationStatus
{
    Aktif = 1,
    Tamamlandi = 2,
    Iptal = 3
}

public enum ProductMenuStatus
{
    Aktif = 1,
    Pasif = 2,
    Tukendi = 3
}
