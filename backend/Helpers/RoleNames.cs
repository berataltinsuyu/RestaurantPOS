namespace Backend.Helpers;

public static class RoleNames
{
    public const string Waiter = "Garson";
    public const string Cashier = "Kasiyer";
    public const string BranchManager = "SubeMuduru";
    public const string SystemAdministrator = "SistemYoneticisi";
    public const string PaymentOperatorRoles = Waiter + "," + Cashier + "," + BranchManager + "," + SystemAdministrator;
    public const string CashierManagerAdministratorRoles = Cashier + "," + BranchManager + "," + SystemAdministrator;
}
