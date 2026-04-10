using Backend.DTOs;
using Backend.Entities;
using Backend.Enums;
using Backend.Helpers;
using Backend.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public interface ITableService
{
    Task<List<TableSummaryDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<TableSummaryDto> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<List<TableSummaryDto>> GetByBranchIdAsync(int branchId, CancellationToken cancellationToken = default);
    Task<TableSummaryDto> CreateAsync(CreateTableRequest request, CancellationToken cancellationToken = default);
    Task<TableSummaryDto> UpdateAsync(int id, UpdateTableRequest request, CancellationToken cancellationToken = default);
    Task DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<TableSummaryDto> UpdateStatusAsync(int id, UpdateTableStatusRequest request, CancellationToken cancellationToken = default);
    Task<TableSummaryDto> AssignWaiterAsync(int id, AssignWaiterRequest request, CancellationToken cancellationToken = default);
    Task<TableSummaryDto> OpenTableAsync(int id, OpenTableRequest request, CancellationToken cancellationToken = default);
    Task<TableSummaryDto> MoveTableAsync(int id, MoveTableRequest request, CancellationToken cancellationToken = default);
    Task<TableSummaryDto> MergeTablesAsync(int id, MergeTablesRequest request, CancellationToken cancellationToken = default);
    Task<TableSummaryDto> SplitTableAsync(int id, SplitTableRequest request, CancellationToken cancellationToken = default);
    Task<TableSummaryDto> AddReservationAsync(int id, ReservationRequest request, CancellationToken cancellationToken = default);
}

public class TableService(
    IRepository<RestaurantTable> tableRepository,
    IRepository<Branch> branchRepository,
    IRepository<User> userRepository,
    IRepository<Bill> billRepository,
    IRepository<BillItem> billItemRepository,
    IRepository<Payment> paymentRepository,
    IRepository<TableReservation> reservationRepository,
    IReferenceGenerator referenceGenerator,
    IBillCalculator billCalculator,
    ITableLifecycleService tableLifecycleService,
    ICurrentUserService currentUserService,
    IAuditLogService auditLogService,
    IUnitOfWork unitOfWork) : ITableService
{
    public async Task<List<TableSummaryDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        await tableLifecycleService.ReconcileAsync(cancellationToken: cancellationToken);
        var tables = await TableQuery().OrderBy(x => x.TableNo).ToListAsync(cancellationToken);
        return tables.Select(MapTable).ToList();
    }

    public async Task<TableSummaryDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        await tableLifecycleService.ReconcileTableAsync(id, cancellationToken);
        var table = await TableQuery().FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Table not found.");
        return MapTable(table);
    }

    public async Task<List<TableSummaryDto>> GetByBranchIdAsync(int branchId, CancellationToken cancellationToken = default)
    {
        await tableLifecycleService.ReconcileAsync(branchId, cancellationToken);
        var tables = await TableQuery()
            .Where(x => x.BranchId == branchId)
            .OrderBy(x => x.TableNo)
            .ToListAsync(cancellationToken);

        return tables.Select(MapTable).ToList();
    }

    public async Task<TableSummaryDto> CreateAsync(CreateTableRequest request, CancellationToken cancellationToken = default)
    {
        await EnsureBranchExistsAsync(request.BranchId, cancellationToken);
        await EnsureUniqueTableNoAsync(request.BranchId, request.TableNo, null, cancellationToken);

        var table = new RestaurantTable
        {
            BranchId = request.BranchId,
            TableNo = request.TableNo,
            Capacity = request.Capacity,
            AreaName = request.AreaName,
            IsMerged = request.IsMerged,
            Status = RestaurantTableStatus.Bos
        };

        await tableRepository.AddAsync(table, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        await auditLogService.CreateAsync(currentUserService.UserId, "Create", nameof(RestaurantTable), table.Id.ToString(), $"Table {table.TableNo} created.", currentUserService.IpAddress, cancellationToken);
        return await GetByIdAsync(table.Id, cancellationToken);
    }

    public async Task<TableSummaryDto> UpdateAsync(int id, UpdateTableRequest request, CancellationToken cancellationToken = default)
    {
        var table = await tableRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Table not found.");

        await EnsureUniqueTableNoAsync(table.BranchId, request.TableNo, id, cancellationToken);

        table.TableNo = request.TableNo;
        table.Capacity = request.Capacity;
        table.AreaName = request.AreaName;
        table.IsMerged = request.IsMerged;
        tableRepository.Update(table);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        await auditLogService.CreateAsync(currentUserService.UserId, "Update", nameof(RestaurantTable), table.Id.ToString(), $"Table {table.TableNo} updated.", currentUserService.IpAddress, cancellationToken);
        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var table = await tableRepository.Query()
            .Include(x => x.Bills)
            .Include(x => x.Reservations)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Table not found.");

        if (table.Bills.Any())
        {
            throw new ConflictException("Table cannot be deleted because it has bill history.");
        }

        tableRepository.Remove(table);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        await auditLogService.CreateAsync(currentUserService.UserId, "Delete", nameof(RestaurantTable), table.Id.ToString(), $"Table {table.TableNo} deleted.", currentUserService.IpAddress, cancellationToken);
    }

    public async Task<TableSummaryDto> UpdateStatusAsync(int id, UpdateTableStatusRequest request, CancellationToken cancellationToken = default)
    {
        var table = await tableRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Table not found.");

        table.Status = request.Status;
        tableRepository.Update(table);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        await auditLogService.CreateAsync(currentUserService.UserId, "UpdateStatus", nameof(RestaurantTable), table.Id.ToString(), $"Table {table.TableNo} status updated to {request.Status}.", currentUserService.IpAddress, cancellationToken);
        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<TableSummaryDto> AssignWaiterAsync(int id, AssignWaiterRequest request, CancellationToken cancellationToken = default)
    {
        var table = await tableRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Table not found.");
        var waiter = await ValidateWaiterAsync(request.WaiterId, cancellationToken);

        table.WaiterId = waiter.Id;
        tableRepository.Update(table);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        await auditLogService.CreateAsync(currentUserService.UserId, "AssignWaiter", nameof(RestaurantTable), table.Id.ToString(), $"Waiter {waiter.FullName} assigned to table {table.TableNo}. Reason: {request.Reason ?? "N/A"}", currentUserService.IpAddress, cancellationToken);
        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<TableSummaryDto> OpenTableAsync(int id, OpenTableRequest request, CancellationToken cancellationToken = default)
    {
        var table = await TableQuery(includeTracking: true).FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Table not found.");
        var waiter = await ValidateWaiterAsync(request.WaiterId, cancellationToken);

        if (table.CurrentBillId.HasValue && table.CurrentBill?.Status is BillStatus.Acik or BillStatus.OdemeBekliyor)
        {
            throw new ConflictException("Table already has an active bill.");
        }

        var bill = new Bill
        {
            BranchId = table.BranchId,
            TableId = table.Id,
            BillNo = referenceGenerator.CreateBillNumber(),
            WaiterId = waiter.Id,
            CustomerCount = request.GuestCount,
            Note = request.Note,
            Status = BillStatus.Acik,
            OpenedAt = DateTime.UtcNow
        };

        await billRepository.AddAsync(bill, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        table.WaiterId = waiter.Id;
        table.CurrentGuestCount = request.GuestCount;
        table.CurrentBillId = bill.Id;
        table.Status = RestaurantTableStatus.Dolu;
        CompleteDueReservation(table);
        tableRepository.Update(table);

        await unitOfWork.SaveChangesAsync(cancellationToken);
        await auditLogService.CreateAsync(currentUserService.UserId, "OpenTable", nameof(RestaurantTable), table.Id.ToString(), $"Table {table.TableNo} opened with bill {bill.BillNo}.", currentUserService.IpAddress, cancellationToken);
        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<TableSummaryDto> MoveTableAsync(int id, MoveTableRequest request, CancellationToken cancellationToken = default)
    {
        var sourceTable = await TableQuery(includeTracking: true).FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Source table not found.");
        var targetTable = await TableQuery(includeTracking: true).FirstOrDefaultAsync(x => x.Id == request.TargetTableId, cancellationToken)
            ?? throw new NotFoundException("Target table not found.");

        if (!sourceTable.CurrentBillId.HasValue || sourceTable.CurrentBill is null)
        {
            throw new ConflictException("Source table does not have an active bill.");
        }

        if (sourceTable.BranchId != targetTable.BranchId)
        {
            throw new BadRequestException("Tables must belong to the same branch.");
        }

        if (targetTable.CurrentBillId.HasValue && targetTable.CurrentBill is { Status: BillStatus.Acik or BillStatus.OdemeBekliyor })
        {
            throw new ConflictException("Target table already has an active bill. Use merge instead.");
        }

        sourceTable.CurrentBill.TableId = targetTable.Id;
        billRepository.Update(sourceTable.CurrentBill);

        targetTable.CurrentBillId = sourceTable.CurrentBillId;
        targetTable.WaiterId = sourceTable.WaiterId;
        targetTable.CurrentGuestCount = sourceTable.CurrentGuestCount;
        targetTable.Status = sourceTable.Status;
        CompleteDueReservation(targetTable);

        sourceTable.CurrentBillId = null;
        sourceTable.WaiterId = null;
        sourceTable.CurrentGuestCount = 0;
        sourceTable.Status = RestaurantTableStatus.Bos;
        sourceTable.IsMerged = false;

        tableRepository.Update(sourceTable);
        tableRepository.Update(targetTable);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        await auditLogService.CreateAsync(currentUserService.UserId, "MoveTable", nameof(RestaurantTable), sourceTable.Id.ToString(), $"Bill moved from {sourceTable.TableNo} to {targetTable.TableNo}.", currentUserService.IpAddress, cancellationToken);
        return await GetByIdAsync(targetTable.Id, cancellationToken);
    }

    public async Task<TableSummaryDto> MergeTablesAsync(int id, MergeTablesRequest request, CancellationToken cancellationToken = default)
    {
        var primaryTable = await TableQuery(includeTracking: true).FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Primary table not found.");

        if (!primaryTable.CurrentBillId.HasValue || primaryTable.CurrentBill is null)
        {
            throw new ConflictException("Primary table does not have an active bill.");
        }

        var targetTableIds = request.TargetTableIds
            .Where(targetTableId => targetTableId != id)
            .Distinct()
            .ToList();

        if (targetTableIds.Count == 0)
        {
            throw new BadRequestException("At least one different table must be selected for merge.");
        }

        var targetTables = await TableQuery(includeTracking: true)
            .Where(x => targetTableIds.Contains(x.Id))
            .ToListAsync(cancellationToken);

        if (targetTables.Count != targetTableIds.Count)
        {
            throw new BadRequestException("One or more tables could not be found.");
        }

        var mergeTimestamp = DateTime.UtcNow;
        foreach (var targetTable in targetTables)
        {
            if (targetTable.BranchId != primaryTable.BranchId)
            {
                throw new BadRequestException("All tables must belong to the same branch.");
            }

            if (!targetTable.CurrentBillId.HasValue || targetTable.CurrentBill is null)
            {
                throw new ConflictException($"Table {targetTable.TableNo} does not have an active bill.");
            }

            if (targetTable.CurrentBill.Status is BillStatus.Kapandi or BillStatus.Iptal)
            {
                throw new ConflictException($"Table {targetTable.TableNo} cannot be merged because its bill is already closed.");
            }

            foreach (var item in targetTable.CurrentBill.Items.ToList())
            {
                item.BillId = primaryTable.CurrentBill.Id;
                item.Bill = primaryTable.CurrentBill;
                primaryTable.CurrentBill.Items.Add(item);
                targetTable.CurrentBill.Items.Remove(item);
                billItemRepository.Update(item);
            }

            foreach (var payment in targetTable.CurrentBill.Payments.ToList())
            {
                payment.BillId = primaryTable.CurrentBill.Id;
                payment.Bill = primaryTable.CurrentBill;
                primaryTable.CurrentBill.Payments.Add(payment);
                targetTable.CurrentBill.Payments.Remove(payment);
                paymentRepository.Update(payment);
            }

            primaryTable.CurrentGuestCount += targetTable.CurrentGuestCount;
            primaryTable.CurrentBill.CustomerCount += targetTable.CurrentBill.CustomerCount;
            targetTable.WaiterId = primaryTable.WaiterId;
            targetTable.CurrentBillId = primaryTable.CurrentBillId;
            targetTable.IsMerged = true;
            tableRepository.Update(targetTable);

            targetTable.CurrentBill.Status = BillStatus.Kapandi;
            targetTable.CurrentBill.ClosedAt = mergeTimestamp;
            targetTable.CurrentBill.Note = $"Merged into {primaryTable.CurrentBill.BillNo}";
            targetTable.CurrentBill.Subtotal = 0;
            targetTable.CurrentBill.ManualDiscountAmount = 0;
            targetTable.CurrentBill.DiscountAmount = 0;
            targetTable.CurrentBill.ServiceCharge = 0;
            targetTable.CurrentBill.VatAmount = 0;
            targetTable.CurrentBill.TotalAmount = 0;
            targetTable.CurrentBill.PaidAmount = 0;
            targetTable.CurrentBill.RemainingAmount = 0;
            billRepository.Update(targetTable.CurrentBill);
        }

        if (!string.IsNullOrWhiteSpace(request.MergedName))
        {
            primaryTable.CurrentBill.Note = string.IsNullOrWhiteSpace(primaryTable.CurrentBill.Note)
                ? $"Merged Name: {request.MergedName}"
                : $"{primaryTable.CurrentBill.Note} | Merged Name: {request.MergedName}";
        }

        primaryTable.IsMerged = true;
        billCalculator.Recalculate(primaryTable.CurrentBill);
        var mergedStatus = primaryTable.CurrentBill.Status == BillStatus.OdemeBekliyor
            ? RestaurantTableStatus.OdemeBekliyor
            : RestaurantTableStatus.Dolu;

        primaryTable.Status = mergedStatus;
        foreach (var targetTable in targetTables)
        {
            targetTable.Status = mergedStatus;
            tableRepository.Update(targetTable);
        }

        billRepository.Update(primaryTable.CurrentBill);
        tableRepository.Update(primaryTable);

        await unitOfWork.SaveChangesAsync(cancellationToken);
        await tableLifecycleService.SyncBillTablesAsync(primaryTable.CurrentBill, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        await auditLogService.CreateAsync(currentUserService.UserId, "MergeTables", nameof(RestaurantTable), primaryTable.Id.ToString(), $"Merged tables into {primaryTable.TableNo}.", currentUserService.IpAddress, cancellationToken);
        return await GetByIdAsync(primaryTable.Id, cancellationToken);
    }

    public async Task<TableSummaryDto> SplitTableAsync(int id, SplitTableRequest request, CancellationToken cancellationToken = default)
    {
        var sourceTable = await TableQuery(includeTracking: true).FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Source table not found.");

        if (!sourceTable.CurrentBillId.HasValue || sourceTable.CurrentBill is null)
        {
            throw new ConflictException("Source table does not have an active bill.");
        }

        await EnsureUniqueTableNoAsync(sourceTable.BranchId, request.NewTableNo, null, cancellationToken);

        var selectedItems = sourceTable.CurrentBill.Items.Where(x => request.BillItemIds.Contains(x.Id)).ToList();
        if (selectedItems.Count != request.BillItemIds.Count)
        {
            throw new BadRequestException("One or more bill items were not found.");
        }

        var newTable = new RestaurantTable
        {
            BranchId = sourceTable.BranchId,
            TableNo = request.NewTableNo,
            Capacity = sourceTable.Capacity,
            AreaName = request.AreaName,
            WaiterId = sourceTable.WaiterId,
            CurrentGuestCount = Math.Max(1, sourceTable.CurrentGuestCount / 2),
            Status = RestaurantTableStatus.Dolu
        };

        await tableRepository.AddAsync(newTable, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var newBill = new Bill
        {
            BranchId = sourceTable.BranchId,
            TableId = newTable.Id,
            BillNo = referenceGenerator.CreateBillNumber(),
            WaiterId = sourceTable.CurrentBill.WaiterId,
            CustomerCount = newTable.CurrentGuestCount,
            Status = BillStatus.Acik,
            OpenedAt = DateTime.UtcNow,
            Note = $"Split from {sourceTable.CurrentBill.BillNo}"
        };

        await billRepository.AddAsync(newBill, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        foreach (var item in selectedItems)
        {
            item.BillId = newBill.Id;
            item.Bill = newBill;
            newBill.Items.Add(item);
            sourceTable.CurrentBill.Items.Remove(item);
            billItemRepository.Update(item);
        }

        newTable.CurrentBillId = newBill.Id;
        tableRepository.Update(newTable);

        billCalculator.Recalculate(newBill);
        billRepository.Update(newBill);

        if (sourceTable.CurrentBill.Items.Any())
        {
            billCalculator.Recalculate(sourceTable.CurrentBill);
            billRepository.Update(sourceTable.CurrentBill);
            sourceTable.Status = sourceTable.CurrentBill.Status == BillStatus.OdemeBekliyor
                ? RestaurantTableStatus.OdemeBekliyor
                : RestaurantTableStatus.Dolu;
        }
        else
        {
            sourceTable.CurrentBill.Status = BillStatus.Kapandi;
            sourceTable.CurrentBill.ClosedAt = DateTime.UtcNow;
            sourceTable.CurrentBill.TotalAmount = 0;
            sourceTable.CurrentBill.RemainingAmount = 0;
            sourceTable.CurrentBill.PaidAmount = 0;
            billRepository.Update(sourceTable.CurrentBill);

            sourceTable.CurrentBillId = null;
            sourceTable.WaiterId = null;
            sourceTable.CurrentGuestCount = 0;
            sourceTable.Status = RestaurantTableStatus.Bos;
        }

        tableRepository.Update(sourceTable);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        await auditLogService.CreateAsync(currentUserService.UserId, "SplitTable", nameof(RestaurantTable), sourceTable.Id.ToString(), $"Split table {sourceTable.TableNo} into {newTable.TableNo}.", currentUserService.IpAddress, cancellationToken);
        return await GetByIdAsync(newTable.Id, cancellationToken);
    }

    public async Task<TableSummaryDto> AddReservationAsync(int id, ReservationRequest request, CancellationToken cancellationToken = default)
    {
        var table = await TableQuery(includeTracking: true).FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Table not found.");

        var existingActiveReservation = table.Reservations.Any(
            x => x.Status == ReservationStatus.Aktif && x.ReservationAt > DateTime.UtcNow.AddMinutes(-30));
        if (existingActiveReservation)
        {
            throw new ConflictException("Table already has an active reservation.");
        }

        var reservation = new TableReservation
        {
            RestaurantTableId = table.Id,
            CustomerName = request.CustomerName,
            PhoneNumber = request.PhoneNumber,
            GuestCount = request.GuestCount,
            ReservationAt = request.ReservationAt,
            Notes = request.Notes,
            Status = ReservationStatus.Aktif
        };

        await reservationRepository.AddAsync(reservation, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        await auditLogService.CreateAsync(currentUserService.UserId, "AddReservation", nameof(RestaurantTable), table.Id.ToString(), $"Reservation added for table {table.TableNo}.", currentUserService.IpAddress, cancellationToken);
        return await GetByIdAsync(id, cancellationToken);
    }

    public static TableSummaryDto MapTable(RestaurantTable table) => new()
    {
        Id = table.Id,
        BranchId = table.BranchId,
        TableNo = table.TableNo,
        Capacity = table.Capacity,
        Status = table.Status,
        WaiterId = table.WaiterId,
        WaiterName = table.Waiter?.FullName,
        CurrentBillId = table.CurrentBillId,
        IsMerged = table.IsMerged,
        AreaName = table.AreaName,
        CurrentGuestCount = table.CurrentGuestCount,
        CreatedAt = table.CreatedAt,
        CurrentTotal = table.CurrentBill?.TotalAmount ?? 0,
        ActiveReservation = table.Reservations
            .Where(x => x.Status == ReservationStatus.Aktif)
            .OrderBy(x => x.ReservationAt)
            .Select(x => new ReservationInfoDto
            {
                Id = x.Id,
                CustomerName = x.CustomerName,
                PhoneNumber = x.PhoneNumber,
                GuestCount = x.GuestCount,
                ReservationAt = x.ReservationAt,
                Notes = x.Notes,
                Status = x.Status
            })
            .FirstOrDefault()
    };

    private IQueryable<RestaurantTable> TableQuery(bool includeTracking = false)
    {
        var query = tableRepository.Query()
            .Include(x => x.Waiter)
            .Include(x => x.CurrentBill)
            .ThenInclude(x => x!.Items)
            .Include(x => x.CurrentBill)
            .ThenInclude(x => x!.Payments)
            .Include(x => x.Reservations);

        return includeTracking ? query : query.AsNoTracking();
    }

    private async Task EnsureBranchExistsAsync(int branchId, CancellationToken cancellationToken)
    {
        var exists = await branchRepository.AnyAsync(x => x.Id == branchId, cancellationToken);
        if (!exists)
        {
            throw new BadRequestException("Branch not found.");
        }
    }

    private async Task EnsureUniqueTableNoAsync(int branchId, string tableNo, int? currentId, CancellationToken cancellationToken)
    {
        var exists = await tableRepository.Query()
            .AnyAsync(x => x.BranchId == branchId && x.TableNo == tableNo && (!currentId.HasValue || x.Id != currentId.Value), cancellationToken);
        if (exists)
        {
            throw new ConflictException("Table number already exists.");
        }
    }

    private async Task<User> ValidateWaiterAsync(int waiterId, CancellationToken cancellationToken)
    {
        var waiter = await userRepository.Query()
            .Include(x => x.Role)
            .FirstOrDefaultAsync(x => x.Id == waiterId, cancellationToken)
            ?? throw new BadRequestException("Waiter not found.");

        if (waiter.Role?.Name != RoleNames.Waiter && waiter.Role?.Name != RoleNames.BranchManager)
        {
            throw new BadRequestException("Selected user cannot be assigned as waiter.");
        }

        return waiter;
    }

    private static void CompleteDueReservation(RestaurantTable table)
    {
        var now = DateTime.UtcNow;
        var reservation = table.Reservations
            .Where(x => x.Status == ReservationStatus.Aktif && x.ReservationAt <= now.AddMinutes(45))
            .OrderBy(x => x.ReservationAt)
            .FirstOrDefault();

        if (reservation is not null)
        {
            reservation.Status = ReservationStatus.Tamamlandi;
        }
    }
}
