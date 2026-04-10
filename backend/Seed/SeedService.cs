using Backend.Entities;
using Backend.Enums;
using Backend.Helpers;
using Backend.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Seed;

public interface ISeedService
{
    Task SeedAsync(CancellationToken cancellationToken = default);
}

public class SeedService(
    IRepository<Role> roleRepository,
    IRepository<Permission> permissionRepository,
    IRepository<RolePermission> rolePermissionRepository,
    IRepository<User> userRepository,
    IRepository<Branch> branchRepository,
    IRepository<RestaurantTable> tableRepository,
    IRepository<ProductCategory> categoryRepository,
    IRepository<Product> productRepository,
    IRepository<PosTerminal> terminalRepository,
    IRepository<Bill> billRepository,
    IRepository<BillItem> billItemRepository,
    IRepository<Payment> paymentRepository,
    IRepository<PrinterSetting> printerRepository,
    IRepository<AppSetting> appSettingRepository,
    IRepository<Shift> shiftRepository,
    IPasswordHasherService passwordHasherService,
    IReferenceGenerator referenceGenerator,
    IBillCalculator billCalculator,
    IUnitOfWork unitOfWork) : ISeedService
{
    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        if (await roleRepository.CountAsync(cancellationToken: cancellationToken) > 0)
        {
            return;
        }

        var roles = new[]
        {
            new Role { Name = RoleNames.Waiter, Description = "Table service and bill management." },
            new Role { Name = RoleNames.Cashier, Description = "Cash desk and payment operations." },
            new Role { Name = RoleNames.BranchManager, Description = "Branch operations management." },
            new Role { Name = RoleNames.SystemAdministrator, Description = "Full system administration." }
        };

        foreach (var role in roles)
        {
            await roleRepository.AddAsync(role, cancellationToken);
        }
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var permissions = new[]
        {
            new Permission { Code = PermissionCode.View, Name = "Goruntule", Description = "View tables and bills.", IsCritical = false },
            new Permission { Code = PermissionCode.Edit, Name = "Duzenle", Description = "Edit bills and tables.", IsCritical = false },
            new Permission { Code = PermissionCode.Discount, Name = "Indirim", Description = "Apply discount.", IsCritical = true },
            new Permission { Code = PermissionCode.Refund, Name = "Iade", Description = "Process refunds.", IsCritical = true },
            new Permission { Code = PermissionCode.Cancel, Name = "Iptal", Description = "Cancel transactions.", IsCritical = true },
            new Permission { Code = PermissionCode.Reports, Name = "Raporlar", Description = "View reports.", IsCritical = false },
            new Permission { Code = PermissionCode.Settings, Name = "Ayarlar", Description = "Manage settings.", IsCritical = true },
            new Permission { Code = PermissionCode.Terminal, Name = "Terminal", Description = "Manage terminals.", IsCritical = true },
            new Permission { Code = PermissionCode.EndOfDay, Name = "GunSonu", Description = "Run end of day reconciliation.", IsCritical = true },
            new Permission { Code = PermissionCode.MenuManagement, Name = "MenuYonetimi", Description = "Manage menu products and availability.", IsCritical = false }
        };

        foreach (var permission in permissions)
        {
            await permissionRepository.AddAsync(permission, cancellationToken);
        }
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var roleMap = roles.ToDictionary(x => x.Name);
        var permissionMap = permissions.ToDictionary(x => x.Code);
        await SeedRolePermissionsAsync(roleMap, permissionMap, cancellationToken);

        var branch = new Branch
        {
            Name = "Gunes Cafe & Restaurant",
            Code = "8547293",
            Address = "Bagdat Cad. No: 45, Kadikoy/Istanbul",
            Phone = "0216 555 0 123",
            Email = "info@gunescafe.com",
            TaxNumber = "1234567890",
            MerchantNumber = "8472651",
            IsActive = true
        };
        await branchRepository.AddAsync(branch, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var users = new[]
        {
            CreateUser("Ahmet Yilmaz", "ahmet", "Ahmet123!", "ahmet@gunescafe.com", roleMap[RoleNames.Waiter], branch.Id),
            CreateUser("Ayse Demir", "ayse", "Ayse123!", "ayse@gunescafe.com", roleMap[RoleNames.Waiter], branch.Id),
            CreateUser("Mehmet Kaya", "kasiyer", "Kasiyer123!", "mehmet@gunescafe.com", roleMap[RoleNames.Cashier], branch.Id),
            CreateUser("Elif Arslan", "mudur", "Mudur123!", "elif@gunescafe.com", roleMap[RoleNames.BranchManager], branch.Id),
            CreateUser("Sistem Yoneticisi", "admin", "Admin123!", "admin@gunescafe.com", roleMap[RoleNames.SystemAdministrator], branch.Id)
        };

        foreach (var user in users)
        {
            await userRepository.AddAsync(user, cancellationToken);
        }
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var waiters = users.Where(x => x.RoleId == roleMap[RoleNames.Waiter].Id).ToList();
        var cashier = users.Single(x => x.RoleId == roleMap[RoleNames.Cashier].Id);

        var tables = new List<RestaurantTable>();
        for (var i = 1; i <= 12; i++)
        {
            var table = new RestaurantTable
            {
                BranchId = branch.Id,
                TableNo = $"M-{i}",
                Capacity = i % 3 == 0 ? 6 : 4,
                AreaName = i <= 8 ? "Ic Salon" : "Teras",
                Status = i is 2 or 5 or 8 or 11 ? RestaurantTableStatus.Bos : i is 3 or 10 ? RestaurantTableStatus.OdemeBekliyor : i == 7 ? RestaurantTableStatus.Odendi : RestaurantTableStatus.Dolu,
                WaiterId = i is 2 or 5 or 8 or 11 ? null : waiters[i % waiters.Count].Id,
                CurrentGuestCount = i is 2 or 5 or 8 or 11 ? 0 : i % 4 + 2
            };
            tables.Add(table);
            await tableRepository.AddAsync(table, cancellationToken);
        }
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var categories = new[]
        {
            new ProductCategory { Name = "Icecekler", IsActive = true },
            new ProductCategory { Name = "Tatlilar", IsActive = true },
            new ProductCategory { Name = "Yemekler", IsActive = true }
        };

        foreach (var category in categories)
        {
            await categoryRepository.AddAsync(category, cancellationToken);
        }
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var products = new[]
        {
            new Product { CategoryId = categories[0].Id, Name = "Espresso", Price = 45, VatRate = 10, IsActive = true, IsMenuActive = true, IsOutOfStock = false, UpdatedAt = DateTime.UtcNow },
            new Product { CategoryId = categories[0].Id, Name = "Cappuccino", Price = 55, VatRate = 10, IsActive = true, IsMenuActive = true, IsOutOfStock = false, UpdatedAt = DateTime.UtcNow },
            new Product { CategoryId = categories[0].Id, Name = "Latte", Price = 60, VatRate = 10, IsActive = true, IsMenuActive = true, IsOutOfStock = false, UpdatedAt = DateTime.UtcNow },
            new Product { CategoryId = categories[0].Id, Name = "Turk Kahvesi", Price = 40, VatRate = 10, IsActive = true, IsMenuActive = true, IsOutOfStock = false, UpdatedAt = DateTime.UtcNow },
            new Product { CategoryId = categories[0].Id, Name = "Cay", Price = 25, VatRate = 10, IsActive = true, IsMenuActive = true, IsOutOfStock = false, UpdatedAt = DateTime.UtcNow },
            new Product { CategoryId = categories[0].Id, Name = "Filtre Kahve", Price = 50, VatRate = 10, IsActive = true, IsMenuActive = true, IsOutOfStock = false, UpdatedAt = DateTime.UtcNow },
            new Product { CategoryId = categories[1].Id, Name = "Croissant", Price = 65, VatRate = 10, IsActive = true, IsMenuActive = true, IsOutOfStock = false, UpdatedAt = DateTime.UtcNow },
            new Product { CategoryId = categories[1].Id, Name = "Cheesecake", Price = 85, VatRate = 10, IsActive = true, IsMenuActive = true, IsOutOfStock = false, UpdatedAt = DateTime.UtcNow },
            new Product { CategoryId = categories[1].Id, Name = "Tiramisu", Price = 95, VatRate = 10, IsActive = true, IsMenuActive = true, IsOutOfStock = false, UpdatedAt = DateTime.UtcNow },
            new Product { CategoryId = categories[1].Id, Name = "Brownie", Price = 75, VatRate = 10, IsActive = true, IsMenuActive = true, IsOutOfStock = false, UpdatedAt = DateTime.UtcNow },
            new Product { CategoryId = categories[2].Id, Name = "Menemen", Price = 120, VatRate = 10, IsActive = true, IsMenuActive = true, IsOutOfStock = false, UpdatedAt = DateTime.UtcNow },
            new Product { CategoryId = categories[2].Id, Name = "Omlet", Price = 110, VatRate = 10, IsActive = true, IsMenuActive = true, IsOutOfStock = false, UpdatedAt = DateTime.UtcNow },
            new Product { CategoryId = categories[2].Id, Name = "Tost", Price = 80, VatRate = 10, IsActive = true, IsMenuActive = true, IsOutOfStock = false, UpdatedAt = DateTime.UtcNow },
            new Product { CategoryId = categories[2].Id, Name = "Sezar Salata", Price = 135, VatRate = 10, IsActive = true, IsMenuActive = true, IsOutOfStock = false, UpdatedAt = DateTime.UtcNow },
            new Product { CategoryId = categories[2].Id, Name = "Club Sandwich", Price = 145, VatRate = 10, IsActive = true, IsMenuActive = true, IsOutOfStock = false, UpdatedAt = DateTime.UtcNow },
            new Product { CategoryId = categories[2].Id, Name = "Makarna", Price = 140, VatRate = 10, IsActive = true, IsMenuActive = true, IsOutOfStock = false, UpdatedAt = DateTime.UtcNow }
        };

        foreach (var product in products)
        {
            await productRepository.AddAsync(product, cancellationToken);
        }
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var terminals = new[]
        {
            new PosTerminal { BranchId = branch.Id, TerminalNo = "VKB-TRM-01", DeviceName = "Ana Kasa POS 1", CashRegisterName = "Kasa 1", Status = PosTerminalStatus.Bagli, LastConnectionAt = DateTime.UtcNow.AddMinutes(-2), LastSuccessfulTransactionAt = DateTime.UtcNow.AddMinutes(-5), IsDefault = true, IsActive = true, IpAddress = "192.168.1.101", Model = "VakifBank SmartPOS Pro", FirmwareVersion = "v4.2.1" },
            new PosTerminal { BranchId = branch.Id, TerminalNo = "VKB-TRM-02", DeviceName = "Garson POS 1", CashRegisterName = "Kasa 2", Status = PosTerminalStatus.Bagli, LastConnectionAt = DateTime.UtcNow.AddMinutes(-1), LastSuccessfulTransactionAt = DateTime.UtcNow.AddMinutes(-12), IsDefault = false, IsActive = true, IpAddress = "192.168.1.102", Model = "VakifBank MobilPOS", FirmwareVersion = "v4.2.1" },
            new PosTerminal { BranchId = branch.Id, TerminalNo = "VKB-TRM-03", DeviceName = "Ana Kasa POS 2", CashRegisterName = "Kasa 1", Status = PosTerminalStatus.Islemde, LastConnectionAt = DateTime.UtcNow, LastSuccessfulTransactionAt = DateTime.UtcNow.AddMinutes(-2), IsDefault = false, IsActive = true, IpAddress = "192.168.1.103", Model = "VakifBank SmartPOS Pro", FirmwareVersion = "v4.2.1" },
            new PosTerminal { BranchId = branch.Id, TerminalNo = "VKB-TRM-04", DeviceName = "Yedek Terminal", CashRegisterName = "Atanmadi", Status = PosTerminalStatus.Cevrimdisi, LastConnectionAt = DateTime.UtcNow.AddHours(-2), LastSuccessfulTransactionAt = DateTime.UtcNow.AddHours(-2), IsDefault = false, IsActive = true, IpAddress = "192.168.1.104", Model = "VakifBank SmartPOS", FirmwareVersion = "v4.1.8" },
            new PosTerminal { BranchId = branch.Id, TerminalNo = "VKB-TRM-05", DeviceName = "Kat Servisi POS", CashRegisterName = "Kasa 3", Status = PosTerminalStatus.Mesgul, LastConnectionAt = DateTime.UtcNow, LastSuccessfulTransactionAt = DateTime.UtcNow.AddMinutes(-8), IsDefault = false, IsActive = true, IpAddress = "192.168.1.105", Model = "VakifBank MobilPOS", FirmwareVersion = "v4.2.0" }
        };

        foreach (var terminal in terminals)
        {
            await terminalRepository.AddAsync(terminal, cancellationToken);
        }
        await unitOfWork.SaveChangesAsync(cancellationToken);

        await SeedBillsAsync(branch, tables, waiters, cashier, products, terminals, cancellationToken);

        await printerRepository.AddAsync(new PrinterSetting
        {
            BranchId = branch.Id,
            PrinterName = "EPSON TM-T88V",
            IpAddress = "192.168.1.50",
            AutoPrintReceipt = true,
            PrintKitchenCopy = false,
            PrintLogo = true,
            IsActive = true
        }, cancellationToken);

        var appSettings = new[]
        {
            new AppSetting { BranchId = branch.Id, Key = "theme", Value = "vakifbank-light", Group = "appearance", Description = "Default app theme", IsActive = true },
            new AppSetting { BranchId = branch.Id, Key = "autoLockSeconds", Value = "300", Group = "security", Description = "Auto lock timeout", IsActive = true },
            new AppSetting { BranchId = branch.Id, Key = "defaultServiceChargeRate", Value = "0.10", Group = "billing", Description = "Default service charge rate", IsActive = true }
        };

        foreach (var setting in appSettings)
        {
            await appSettingRepository.AddAsync(setting, cancellationToken);
        }

        await shiftRepository.AddAsync(new Shift
        {
            BranchId = branch.Id,
            UserId = cashier.Id,
            OpeningCashAmount = 2500,
            OpenedAt = DateTime.UtcNow.AddHours(-8),
            Status = ShiftStatus.Acik,
            Note = "Morning shift"
        }, cancellationToken);

        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private async Task SeedRolePermissionsAsync(Dictionary<string, Role> roleMap, Dictionary<PermissionCode, Permission> permissionMap, CancellationToken cancellationToken)
    {
        var matrix = new Dictionary<string, PermissionCode[]>
        {
            [RoleNames.Waiter] = [PermissionCode.View, PermissionCode.Edit],
            [RoleNames.Cashier] = [PermissionCode.View, PermissionCode.Edit, PermissionCode.Discount, PermissionCode.Refund, PermissionCode.Cancel, PermissionCode.Reports],
            [RoleNames.BranchManager] = Enum.GetValues<PermissionCode>(),
            [RoleNames.SystemAdministrator] = Enum.GetValues<PermissionCode>()
        };

        foreach (var roleEntry in roleMap)
        {
            foreach (var permission in permissionMap.Values)
            {
                await rolePermissionRepository.AddAsync(new RolePermission
                {
                    RoleId = roleEntry.Value.Id,
                    PermissionId = permission.Id,
                    IsEnabled = matrix[roleEntry.Key].Contains(permission.Code)
                }, cancellationToken);
            }
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private User CreateUser(string fullName, string userName, string password, string email, Role role, int branchId)
    {
        var user = new User
        {
            FullName = fullName,
            UserName = userName,
            Email = email,
            RoleId = role.Id,
            BranchId = branchId,
            IsActive = true
        };
        user.PasswordHash = passwordHasherService.HashPassword(user, password);
        return user;
    }

    private async Task SeedBillsAsync(Branch branch, List<RestaurantTable> tables, List<User> waiters, User cashier, Product[] products, PosTerminal[] terminals, CancellationToken cancellationToken)
    {
        var productMap = products.ToDictionary(x => x.Name);
        var tableMap = tables.ToDictionary(x => x.TableNo);

        var activeBillSeeds = new Dictionary<string, List<(string ProductName, int Quantity, BillItemStatus Status)>>()
        {
            ["M-1"] = [("Cappuccino", 2, BillItemStatus.ServisEdildi), ("Club Sandwich", 2, BillItemStatus.ServisEdildi), ("Cheesecake", 2, BillItemStatus.Hazirlaniyor), ("Latte", 2, BillItemStatus.ServisEdildi)],
            ["M-3"] = [("Espresso", 2, BillItemStatus.ServisEdildi), ("Sezar Salata", 2, BillItemStatus.ServisEdildi), ("Brownie", 1, BillItemStatus.Hazirlaniyor)],
            ["M-4"] = [("Turk Kahvesi", 3, BillItemStatus.ServisEdildi), ("Menemen", 3, BillItemStatus.ServisEdildi), ("Makarna", 2, BillItemStatus.Hazirlaniyor), ("Cay", 4, BillItemStatus.ServisEdildi)],
            ["M-6"] = [("Latte", 3, BillItemStatus.ServisEdildi), ("Croissant", 3, BillItemStatus.Hazirlaniyor), ("Tiramisu", 2, BillItemStatus.ServisEdildi)],
            ["M-9"] = [("Filtre Kahve", 4, BillItemStatus.ServisEdildi), ("Club Sandwich", 3, BillItemStatus.ServisEdildi), ("Cheesecake", 3, BillItemStatus.Hazirlaniyor)],
            ["M-10"] = [("Cappuccino", 4, BillItemStatus.ServisEdildi), ("Tost", 4, BillItemStatus.ServisEdildi), ("Brownie", 3, BillItemStatus.Hazirlaniyor)],
            ["M-12"] = [("Espresso", 2, BillItemStatus.ServisEdildi), ("Omlet", 2, BillItemStatus.ServisEdildi)]
        };

        foreach (var seed in activeBillSeeds)
        {
            var table = tableMap[seed.Key];
            var waiterId = table.WaiterId ?? waiters.First().Id;
            var bill = new Bill
            {
                BranchId = branch.Id,
                TableId = table.Id,
                BillNo = referenceGenerator.CreateBillNumber(),
                WaiterId = waiterId,
                CustomerCount = table.CurrentGuestCount,
                Status = table.Status == RestaurantTableStatus.OdemeBekliyor ? BillStatus.OdemeBekliyor : BillStatus.Acik,
                OpenedAt = DateTime.UtcNow.AddMinutes(-90)
            };

            await billRepository.AddAsync(bill, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            foreach (var (productName, quantity, status) in seed.Value)
            {
                var product = productMap[productName];
                var item = new BillItem
                {
                    BillId = bill.Id,
                    ProductId = product.Id,
                    ProductNameSnapshot = product.Name,
                    UnitPrice = product.Price,
                    VatRate = product.VatRate,
                    Quantity = quantity,
                    LineTotal = product.Price * quantity,
                    Status = status
                };
                await billItemRepository.AddAsync(item, cancellationToken);
                bill.Items.Add(item);
            }

            billCalculator.Recalculate(bill);
            billRepository.Update(bill);
            table.CurrentBillId = bill.Id;
            table.WaiterId = waiterId;
            tableRepository.Update(table);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }

        var historicalSeeds = new[]
        {
            new { TableNo = "M-7", BillNo = "A-0157", Terminal = terminals[0], Type = PaymentType.Kart, Amount = 385.50m, Status = PaymentStatus.Basarili, When = new DateTime(2026, 4, 7, 14, 25, 0, DateTimeKind.Utc), Reference = "REF-789456123" },
            new { TableNo = "M-5", BillNo = "A-0156", Terminal = terminals[1], Type = PaymentType.Nakit, Amount = 540.00m, Status = PaymentStatus.Basarili, When = new DateTime(2026, 4, 7, 13, 50, 0, DateTimeKind.Utc), Reference = "REF-789456124" },
            new { TableNo = "M-2", BillNo = "A-0155", Terminal = terminals[0], Type = PaymentType.Kart, Amount = 675.25m, Status = PaymentStatus.Basarili, When = new DateTime(2026, 4, 7, 13, 15, 0, DateTimeKind.Utc), Reference = "REF-789456122" },
            new { TableNo = "M-8", BillNo = "A-0154", Terminal = terminals[0], Type = PaymentType.BolunmusOdeme, Amount = 890.50m, Status = PaymentStatus.Basarili, When = new DateTime(2026, 4, 7, 12, 45, 0, DateTimeKind.Utc), Reference = "REF-789456121" },
            new { TableNo = "M-3", BillNo = "A-0153", Terminal = terminals[1], Type = PaymentType.Kart, Amount = 420.00m, Status = PaymentStatus.Basarisiz, When = new DateTime(2026, 4, 7, 12, 30, 0, DateTimeKind.Utc), Reference = "REF-789456120" },
            new { TableNo = "M-4", BillNo = "A-0152", Terminal = terminals[0], Type = PaymentType.Kart, Amount = 1250.75m, Status = PaymentStatus.Basarili, When = new DateTime(2026, 4, 6, 19, 30, 0, DateTimeKind.Utc), Reference = "REF-789456119" },
            new { TableNo = "M-6", BillNo = "A-0151", Terminal = terminals[1], Type = PaymentType.Nakit, Amount = 680.00m, Status = PaymentStatus.Basarili, When = new DateTime(2026, 4, 6, 18, 45, 0, DateTimeKind.Utc), Reference = "REF-789456118" },
            new { TableNo = "M-1", BillNo = "A-0150", Terminal = terminals[0], Type = PaymentType.Kart, Amount = 945.50m, Status = PaymentStatus.Basarili, When = new DateTime(2026, 4, 6, 17, 20, 0, DateTimeKind.Utc), Reference = "REF-789456117" }
        };

        foreach (var seed in historicalSeeds)
        {
            var table = tableMap[seed.TableNo];
            var bill = new Bill
            {
                BranchId = branch.Id,
                TableId = table.Id,
                BillNo = seed.BillNo,
                WaiterId = waiters.First().Id,
                CustomerCount = Math.Max(2, table.CurrentGuestCount),
                Status = seed.Status == PaymentStatus.Basarisiz ? BillStatus.OdemeBekliyor : BillStatus.Kapandi,
                OpenedAt = seed.When.AddMinutes(-35),
                ClosedAt = seed.Status == PaymentStatus.Basarili ? seed.When : null
            };

            await billRepository.AddAsync(bill, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            var seededItems = new[]
            {
                new BillItem { BillId = bill.Id, ProductId = productMap["Cappuccino"].Id, ProductNameSnapshot = "Cappuccino", UnitPrice = 55, VatRate = 10, Quantity = 2, LineTotal = 110, Status = BillItemStatus.ServisEdildi },
                new BillItem { BillId = bill.Id, ProductId = productMap["Club Sandwich"].Id, ProductNameSnapshot = "Club Sandwich", UnitPrice = 145, VatRate = 10, Quantity = 2, LineTotal = 290, Status = BillItemStatus.ServisEdildi }
            };

            foreach (var item in seededItems)
            {
                await billItemRepository.AddAsync(item, cancellationToken);
                bill.Items.Add(item);
            }

            if (seed.Type == PaymentType.BolunmusOdeme)
            {
                var groupId = "SPL-SEED-001";
                var part1 = new Payment
                {
                    BillId = bill.Id,
                    TerminalId = terminals[0].Id,
                    PaymentType = PaymentType.Kart,
                    Amount = 445.25m,
                    Status = PaymentStatus.Basarili,
                    ReferenceNo = seed.Reference,
                    BankApprovalCode = referenceGenerator.CreateApprovalCode(),
                    CardMaskedPan = "****4532",
                    CreatedAt = seed.When,
                    CompletedAt = seed.When,
                    CreatedByUserId = cashier.Id,
                    SplitPaymentGroupId = groupId
                };
                var part2 = new Payment
                {
                    BillId = bill.Id,
                    PaymentType = PaymentType.Nakit,
                    Amount = 445.25m,
                    Status = PaymentStatus.Basarili,
                    ReferenceNo = referenceGenerator.CreatePaymentReference(),
                    CreatedAt = seed.When,
                    CompletedAt = seed.When,
                    CreatedByUserId = cashier.Id,
                    SplitPaymentGroupId = groupId
                };
                await paymentRepository.AddAsync(part1, cancellationToken);
                await paymentRepository.AddAsync(part2, cancellationToken);
                bill.Payments.Add(part1);
                bill.Payments.Add(part2);
            }
            else
            {
                var payment = new Payment
                {
                    BillId = bill.Id,
                    TerminalId = seed.Type == PaymentType.Nakit ? null : seed.Terminal.Id,
                    PaymentType = seed.Type,
                    Amount = seed.Amount,
                    Status = seed.Status,
                    ReferenceNo = seed.Reference,
                    BankApprovalCode = seed.Type == PaymentType.Kart && seed.Status == PaymentStatus.Basarili ? referenceGenerator.CreateApprovalCode() : null,
                    CardMaskedPan = seed.Type == PaymentType.Kart ? "****4532" : null,
                    ErrorCode = seed.Status == PaymentStatus.Basarisiz ? "ERR-POS-4021" : null,
                    ErrorMessage = seed.Status == PaymentStatus.Basarisiz ? "Kart limiti yetersiz. Islem reddedildi." : null,
                    CreatedAt = seed.When,
                    CompletedAt = seed.When,
                    CreatedByUserId = cashier.Id
                };
                await paymentRepository.AddAsync(payment, cancellationToken);
                bill.Payments.Add(payment);
            }

            billCalculator.Recalculate(bill);
            billRepository.Update(bill);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
