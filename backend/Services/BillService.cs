using Backend.DTOs;
using Backend.Entities;
using Backend.Enums;
using Backend.Helpers;
using Backend.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public interface IBillService
{
    Task<List<BillSummaryDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<BillSummaryDto> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<BillSummaryDto?> GetByTableIdAsync(int tableId, CancellationToken cancellationToken = default);
    Task<BillSummaryDto> CreateAsync(CreateBillRequest request, CancellationToken cancellationToken = default);
    Task<BillSummaryDto> UpdateAsync(int id, UpdateBillRequest request, CancellationToken cancellationToken = default);
    Task<BillSummaryDto> CloseAsync(int id, CancellationToken cancellationToken = default);
    Task<BillSummaryDto> CancelAsync(int id, CancellationToken cancellationToken = default);
    Task<BillSummaryDto> ApplyDiscountAsync(int id, ApplyDiscountRequest request, CancellationToken cancellationToken = default);
    Task<BillSummaryDto> UpdateServiceChargeAsync(int id, UpdateServiceChargeRequest request, CancellationToken cancellationToken = default);
    Task<List<BillItemDto>> GetItemsAsync(int billId, CancellationToken cancellationToken = default);
    Task<BillItemDto> AddItemAsync(int billId, AddBillItemRequest request, CancellationToken cancellationToken = default);
    Task<BillItemDto> UpdateItemAsync(int id, UpdateBillItemRequest request, CancellationToken cancellationToken = default);
    Task<BillItemDto> UpdateItemStatusAsync(int id, UpdateBillItemStatusRequest request, CancellationToken cancellationToken = default);
    Task DeleteItemAsync(int id, CancellationToken cancellationToken = default);
    Task<BillSummaryDto> ApproveComplimentaryAsync(int billId, ComplimentaryApprovalRequest request, CancellationToken cancellationToken = default);
}

public class BillService(
    IRepository<Bill> billRepository,
    IRepository<BillItem> billItemRepository,
    IRepository<Product> productRepository,
    IRepository<RestaurantTable> tableRepository,
    IRepository<User> userRepository,
    IRepository<Branch> branchRepository,
    IReferenceGenerator referenceGenerator,
    IBillCalculator billCalculator,
    ITableLifecycleService tableLifecycleService,
    ICurrentUserService currentUserService,
    IAuditLogService auditLogService,
    IUnitOfWork unitOfWork) : IBillService
{
    public async Task<List<BillSummaryDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var bills = await BillQuery().OrderByDescending(x => x.OpenedAt).ToListAsync(cancellationToken);
        return bills.Select(MapBill).ToList();
    }

    public async Task<BillSummaryDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var bill = await BillQuery().FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Bill not found.");
        return MapBill(bill);
    }

    public async Task<BillSummaryDto?> GetByTableIdAsync(int tableId, CancellationToken cancellationToken = default)
    {
        await tableLifecycleService.ReconcileTableAsync(tableId, cancellationToken);

        var currentBillId = await tableRepository.Query()
            .AsNoTracking()
            .Where(x => x.Id == tableId)
            .Select(x => x.CurrentBillId)
            .FirstOrDefaultAsync(cancellationToken);

        if (currentBillId.HasValue)
        {
            var currentBill = await BillQuery()
                .FirstOrDefaultAsync(x => x.Id == currentBillId.Value, cancellationToken);

            if (currentBill is not null)
            {
                return MapBill(currentBill);
            }
        }

        var bill = await BillQuery()
            .Where(x => x.TableId == tableId && x.Status != BillStatus.Iptal)
            .OrderByDescending(x => x.OpenedAt)
            .FirstOrDefaultAsync(cancellationToken);

        return bill is null ? null : MapBill(bill);
    }

    public async Task<BillSummaryDto> CreateAsync(CreateBillRequest request, CancellationToken cancellationToken = default)
    {
        var table = await tableRepository.GetByIdAsync(request.TableId, cancellationToken)
            ?? throw new BadRequestException("Table not found.");
        var branchExists = await branchRepository.AnyAsync(x => x.Id == request.BranchId, cancellationToken);
        var waiterExists = await userRepository.AnyAsync(x => x.Id == request.WaiterId, cancellationToken);
        if (!branchExists || !waiterExists)
        {
            throw new BadRequestException("Branch or waiter not found.");
        }

        if (table.CurrentBillId.HasValue)
        {
            throw new ConflictException("Table already has an active bill.");
        }

        var bill = new Bill
        {
            BranchId = request.BranchId,
            TableId = request.TableId,
            BillNo = referenceGenerator.CreateBillNumber(),
            WaiterId = request.WaiterId,
            CustomerCount = request.CustomerCount,
            Note = request.Note,
            Status = BillStatus.Acik,
            OpenedAt = DateTime.UtcNow
        };

        await billRepository.AddAsync(bill, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        table.CurrentBillId = bill.Id;
        table.WaiterId = request.WaiterId;
        table.CurrentGuestCount = request.CustomerCount;
        table.Status = RestaurantTableStatus.Dolu;
        tableRepository.Update(table);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        await auditLogService.CreateAsync(currentUserService.UserId, "Create", nameof(Bill), bill.Id.ToString(), $"Bill {bill.BillNo} created.", currentUserService.IpAddress, cancellationToken);
        return await GetByIdAsync(bill.Id, cancellationToken);
    }

    public async Task<BillSummaryDto> UpdateAsync(int id, UpdateBillRequest request, CancellationToken cancellationToken = default)
    {
        var bill = await LoadBillForUpdateAsync(id, cancellationToken);

        bill.CustomerCount = request.CustomerCount;
        bill.Note = request.Note;
        billRepository.Update(bill);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        await auditLogService.CreateAsync(currentUserService.UserId, "Update", nameof(Bill), bill.Id.ToString(), $"Bill {bill.BillNo} updated.", currentUserService.IpAddress, cancellationToken);
        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<BillSummaryDto> CloseAsync(int id, CancellationToken cancellationToken = default)
    {
        var bill = await LoadBillForUpdateAsync(id, cancellationToken);
        billCalculator.Recalculate(bill);

        if (bill.RemainingAmount > 0)
        {
            throw new ConflictException("Bill cannot be closed until it is fully paid.");
        }

        bill.Status = BillStatus.Kapandi;
        bill.ClosedAt = DateTime.UtcNow;
        await tableLifecycleService.SyncBillTablesAsync(bill, cancellationToken);
        billRepository.Update(bill);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        await auditLogService.CreateAsync(currentUserService.UserId, "Close", nameof(Bill), bill.Id.ToString(), $"Bill {bill.BillNo} closed.", currentUserService.IpAddress, cancellationToken);
        return MapBill(bill);
    }

    public async Task<BillSummaryDto> CancelAsync(int id, CancellationToken cancellationToken = default)
    {
        var bill = await LoadBillForUpdateAsync(id, cancellationToken);
        if (bill.PaidAmount > 0)
        {
            throw new ConflictException("Paid bills must be refunded before cancellation.");
        }

        bill.Status = BillStatus.Iptal;
        bill.ClosedAt = DateTime.UtcNow;
        bill.TotalAmount = 0;
        bill.Subtotal = 0;
        bill.ServiceCharge = 0;
        bill.VatAmount = 0;
        bill.DiscountAmount = 0;
        bill.ManualDiscountAmount = 0;
        bill.PaidAmount = 0;
        bill.RemainingAmount = 0;

        await tableLifecycleService.SyncBillTablesAsync(bill, cancellationToken);
        billRepository.Update(bill);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        await auditLogService.CreateAsync(currentUserService.UserId, "Cancel", nameof(Bill), bill.Id.ToString(), $"Bill {bill.BillNo} cancelled.", currentUserService.IpAddress, cancellationToken);
        return MapBill(bill);
    }

    public async Task<BillSummaryDto> ApplyDiscountAsync(int id, ApplyDiscountRequest request, CancellationToken cancellationToken = default)
    {
        var bill = await LoadBillForUpdateAsync(id, cancellationToken);
        if (request.Amount > bill.Subtotal)
        {
            throw new BadRequestException("Discount cannot exceed subtotal.");
        }

        bill.ManualDiscountAmount = request.Amount;
        billCalculator.Recalculate(bill);
        await tableLifecycleService.SyncBillTablesAsync(bill, cancellationToken);
        billRepository.Update(bill);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        await auditLogService.CreateAsync(currentUserService.UserId, "Discount", nameof(Bill), bill.Id.ToString(), $"Discount applied to bill {bill.BillNo}: {request.Amount}.", currentUserService.IpAddress, cancellationToken);
        return MapBill(bill);
    }

    public async Task<BillSummaryDto> UpdateServiceChargeAsync(int id, UpdateServiceChargeRequest request, CancellationToken cancellationToken = default)
    {
        var bill = await LoadBillForUpdateAsync(id, cancellationToken);
        bill.ServiceChargeRate = request.Rate;
        billCalculator.Recalculate(bill);
        await tableLifecycleService.SyncBillTablesAsync(bill, cancellationToken);
        billRepository.Update(bill);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        await auditLogService.CreateAsync(currentUserService.UserId, "ServiceCharge", nameof(Bill), bill.Id.ToString(), $"Service charge updated for bill {bill.BillNo}.", currentUserService.IpAddress, cancellationToken);
        return MapBill(bill);
    }

    public async Task<List<BillItemDto>> GetItemsAsync(int billId, CancellationToken cancellationToken = default)
    {
        var items = await billItemRepository.Query()
            .AsNoTracking()
            .Where(x => x.BillId == billId)
            .OrderBy(x => x.Id)
            .ToListAsync(cancellationToken);

        return items.Select(MapItem).ToList();
    }

    public async Task<BillItemDto> AddItemAsync(int billId, AddBillItemRequest request, CancellationToken cancellationToken = default)
    {
        var bill = await LoadBillForUpdateAsync(billId, cancellationToken);
        EnsureBillIsEditable(bill);

        var product = await productRepository.Query()
            .Include(x => x.Category)
            .FirstOrDefaultAsync(x => x.Id == request.ProductId, cancellationToken)
            ?? throw new BadRequestException("Product not found.");

        if (!product.IsActive || !product.IsMenuActive || product.IsOutOfStock || product.Category is null || !product.Category.IsActive)
        {
            throw new ConflictException("Selected product is not available for ordering.");
        }

        var billItem = new BillItem
        {
            BillId = bill.Id,
            ProductId = product.Id,
            ProductNameSnapshot = product.Name,
            UnitPrice = product.Price,
            VatRate = product.VatRate,
            Quantity = request.Quantity,
            LineTotal = Math.Round(product.Price * request.Quantity, 2, MidpointRounding.AwayFromZero),
            Note = request.Note,
            Status = BillItemStatus.Hazirlaniyor
        };

        await billItemRepository.AddAsync(billItem, cancellationToken);
        billCalculator.Recalculate(bill);
        await tableLifecycleService.SyncBillTablesAsync(bill, cancellationToken);
        billRepository.Update(bill);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        await auditLogService.CreateAsync(currentUserService.UserId, "AddBillItem", nameof(Bill), bill.Id.ToString(), $"Item {product.Name} added to bill {bill.BillNo}.", currentUserService.IpAddress, cancellationToken);
        return MapItem(billItem);
    }

    public async Task<BillItemDto> UpdateItemAsync(int id, UpdateBillItemRequest request, CancellationToken cancellationToken = default)
    {
        var item = await billItemRepository.Query()
            .Include(x => x.Bill)
            .ThenInclude(x => x!.Items)
            .Include(x => x.Bill)
            .ThenInclude(x => x!.Payments)
            .Include(x => x.Bill)
            .ThenInclude(x => x!.Table)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Bill item not found.");

        EnsureBillIsEditable(item.Bill!);

        item.Quantity = request.Quantity;
        item.Note = request.Note;
        item.LineTotal = Math.Round(item.UnitPrice * item.Quantity, 2, MidpointRounding.AwayFromZero);
        billItemRepository.Update(item);

        billCalculator.Recalculate(item.Bill!);
        await tableLifecycleService.SyncBillTablesAsync(item.Bill!, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        await auditLogService.CreateAsync(currentUserService.UserId, "UpdateBillItem", nameof(BillItem), item.Id.ToString(), $"Item {item.ProductNameSnapshot} updated.", currentUserService.IpAddress, cancellationToken);
        return MapItem(item);
    }

    public async Task<BillItemDto> UpdateItemStatusAsync(int id, UpdateBillItemStatusRequest request, CancellationToken cancellationToken = default)
    {
        var item = await billItemRepository.Query()
            .Include(x => x.Bill)
            .ThenInclude(x => x!.Items)
            .Include(x => x.Bill)
            .ThenInclude(x => x!.Payments)
            .Include(x => x.Bill)
            .ThenInclude(x => x!.Table)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Bill item not found.");

        item.Status = request.Status;
        if (!string.IsNullOrWhiteSpace(request.Reason))
        {
            item.Note = string.IsNullOrWhiteSpace(item.Note) ? request.Reason : $"{item.Note} | {request.Reason}";
        }

        billItemRepository.Update(item);
        billCalculator.Recalculate(item.Bill!);
        await tableLifecycleService.SyncBillTablesAsync(item.Bill!, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        await auditLogService.CreateAsync(currentUserService.UserId, "UpdateBillItemStatus", nameof(BillItem), item.Id.ToString(), $"Item {item.ProductNameSnapshot} status updated to {request.Status}.", currentUserService.IpAddress, cancellationToken);
        return MapItem(item);
    }

    public async Task DeleteItemAsync(int id, CancellationToken cancellationToken = default)
    {
        var item = await billItemRepository.Query()
            .Include(x => x.Bill)
            .ThenInclude(x => x!.Items)
            .Include(x => x.Bill)
            .ThenInclude(x => x!.Payments)
            .Include(x => x.Bill)
            .ThenInclude(x => x!.Table)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Bill item not found.");

        EnsureBillIsEditable(item.Bill!);

        billItemRepository.Remove(item);
        item.Bill!.Items.Remove(item);
        billCalculator.Recalculate(item.Bill);
        await tableLifecycleService.SyncBillTablesAsync(item.Bill, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        await auditLogService.CreateAsync(currentUserService.UserId, "DeleteBillItem", nameof(BillItem), item.Id.ToString(), $"Item {item.ProductNameSnapshot} removed.", currentUserService.IpAddress, cancellationToken);
    }

    public async Task<BillSummaryDto> ApproveComplimentaryAsync(int billId, ComplimentaryApprovalRequest request, CancellationToken cancellationToken = default)
    {
        var bill = await LoadBillForUpdateAsync(billId, cancellationToken);
        var items = bill.Items.Where(x => request.BillItemIds.Contains(x.Id)).ToList();

        if (items.Count != request.BillItemIds.Count)
        {
            throw new BadRequestException("One or more bill items were not found.");
        }

        foreach (var item in items)
        {
            item.Status = BillItemStatus.Ikram;
            billItemRepository.Update(item);
        }

        billCalculator.Recalculate(bill);
        await tableLifecycleService.SyncBillTablesAsync(bill, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var complimentaryAmount = items.Sum(x => x.LineTotal);
        var requiresManagerApproval = complimentaryAmount > 500m;
        var description = $"Complimentary approval for bill {bill.BillNo} by {request.ApproverName}. Amount: {complimentaryAmount}. Reason: {request.Reason}. Requires manager approval: {requiresManagerApproval}.";
        await auditLogService.CreateAsync(currentUserService.UserId, "ComplimentaryApproval", nameof(Bill), bill.Id.ToString(), description, currentUserService.IpAddress, cancellationToken);
        return MapBill(bill);
    }

    public static BillSummaryDto MapBill(Bill bill) => new()
    {
        Id = bill.Id,
        BranchId = bill.BranchId,
        TableId = bill.TableId,
        TableNo = bill.Table?.TableNo ?? string.Empty,
        BillNo = bill.BillNo,
        WaiterId = bill.WaiterId,
        WaiterName = bill.Waiter?.FullName ?? string.Empty,
        Status = bill.Status,
        CustomerCount = bill.CustomerCount,
        Note = bill.Note,
        OpenedAt = bill.OpenedAt,
        ClosedAt = bill.ClosedAt,
        Subtotal = bill.Subtotal,
        DiscountAmount = bill.DiscountAmount,
        ServiceCharge = bill.ServiceCharge,
        VatAmount = bill.VatAmount,
        TotalAmount = bill.TotalAmount,
        PaidAmount = bill.PaidAmount,
        RemainingAmount = bill.RemainingAmount,
        Items = bill.Items.OrderBy(x => x.Id).Select(MapItem).ToList()
    };

    public static BillItemDto MapItem(BillItem item) => new()
    {
        Id = item.Id,
        BillId = item.BillId,
        ProductId = item.ProductId,
        ProductNameSnapshot = item.ProductNameSnapshot,
        UnitPrice = item.UnitPrice,
        VatRate = item.VatRate,
        Quantity = item.Quantity,
        LineTotal = item.LineTotal,
        Note = item.Note,
        Status = item.Status
    };

    private IQueryable<Bill> BillQuery()
    {
        return billRepository.Query()
            .AsNoTracking()
            .Include(x => x.Table)
            .Include(x => x.Waiter)
            .Include(x => x.Items)
            .Include(x => x.Payments);
    }

    private async Task<Bill> LoadBillForUpdateAsync(int id, CancellationToken cancellationToken)
    {
        return await billRepository.Query()
            .Include(x => x.Table)
            .Include(x => x.Waiter)
            .Include(x => x.Items)
            .Include(x => x.Payments)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Bill not found.");
    }

    private static void EnsureBillIsEditable(Bill bill)
    {
        if (bill.Status is BillStatus.Kapandi or BillStatus.Iptal)
        {
            throw new ConflictException("Closed or cancelled bills cannot be edited.");
        }
    }

}
