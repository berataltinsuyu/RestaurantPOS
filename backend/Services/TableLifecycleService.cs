using Backend.Entities;
using Backend.Enums;
using Backend.Helpers;
using Backend.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Backend.Services;

public interface ITableLifecycleService
{
    Task ReconcileAsync(int? branchId = null, CancellationToken cancellationToken = default);
    Task ReconcileTableAsync(int tableId, CancellationToken cancellationToken = default);
    Task SyncBillTablesAsync(Bill bill, CancellationToken cancellationToken = default);
}

public class TableLifecycleService(
    IRepository<RestaurantTable> tableRepository,
    IRepository<TableReservation> reservationRepository,
    IRepository<Bill> billRepository,
    IBillCalculator billCalculator,
    IUnitOfWork unitOfWork) : ITableLifecycleService
{
    private static readonly TimeSpan ReservationArrivalWindow = TimeSpan.FromMinutes(45);
    private static readonly TimeSpan ReservationNoShowGracePeriod = TimeSpan.FromMinutes(30);

    public async Task ReconcileAsync(int? branchId = null, CancellationToken cancellationToken = default)
    {
        var tables = await TableQuery(includeTracking: true, branchId)
            .ToListAsync(cancellationToken);

        if (tables.Count == 0)
        {
            return;
        }

        var now = DateTime.UtcNow;
        var hasChanges = false;

        foreach (var table in tables)
        {
            hasChanges |= ApplyReservationState(table, now);

            if (table.CurrentBillId.HasValue && table.CurrentBill is null)
            {
                table.CurrentBill = await LoadBillAsync(table.CurrentBillId.Value, cancellationToken);
            }

            if (table.CurrentBill is not null)
            {
                hasChanges |= RecalculateBill(table.CurrentBill);
                hasChanges |= ApplyTableStateFromBill(table, table.CurrentBill, now, null);
            }
            else
            {
                hasChanges |= ResetDetachedTable(table);
            }
        }

        if (hasChanges)
        {
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task ReconcileTableAsync(int tableId, CancellationToken cancellationToken = default)
    {
        var table = await TableQuery(includeTracking: true)
            .FirstOrDefaultAsync(x => x.Id == tableId, cancellationToken);

        if (table is null)
        {
            return;
        }

        var now = DateTime.UtcNow;
        var hasChanges = ApplyReservationState(table, now);

        if (table.CurrentBillId.HasValue && table.CurrentBill is null)
        {
            table.CurrentBill = await LoadBillAsync(table.CurrentBillId.Value, cancellationToken);
        }

        if (table.CurrentBill is not null)
        {
            hasChanges |= RecalculateBill(table.CurrentBill);
            hasChanges |= ApplyTableStateFromBill(table, table.CurrentBill, now, null);
        }
        else
        {
            hasChanges |= ResetDetachedTable(table);
        }

        if (hasChanges)
        {
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task SyncBillTablesAsync(Bill bill, CancellationToken cancellationToken = default)
    {
        var relatedTables = await TableQuery(includeTracking: true)
            .Where(x => x.Id == bill.TableId || x.CurrentBillId == bill.Id)
            .ToListAsync(cancellationToken);

        if (relatedTables.Count == 0)
        {
            var table = await tableRepository.GetByIdAsync(bill.TableId, cancellationToken);
            if (table is not null)
            {
                relatedTables.Add(table);
            }
        }

        var now = DateTime.UtcNow;
        var isMergedGroup = relatedTables.Count > 1;

        foreach (var table in relatedTables)
        {
            ApplyReservationState(table, now);
            ApplyTableStateFromBill(table, bill, now, isMergedGroup);
        }
    }

    private IQueryable<RestaurantTable> TableQuery(bool includeTracking, int? branchId = null)
    {
        IQueryable<RestaurantTable> query = tableRepository.Query()
            .Include(x => x.Waiter)
            .Include(x => x.CurrentBill)
            .ThenInclude(x => x!.Items)
            .Include(x => x.CurrentBill)
            .ThenInclude(x => x!.Payments)
            .Include(x => x.Reservations);

        if (branchId.HasValue)
        {
            query = query.Where(x => x.BranchId == branchId.Value);
        }

        return includeTracking ? query : query.AsNoTracking();
    }

    private Task<Bill?> LoadBillAsync(int billId, CancellationToken cancellationToken)
    {
        return billRepository.Query()
            .Include(x => x.Items)
            .Include(x => x.Payments)
            .FirstOrDefaultAsync(x => x.Id == billId, cancellationToken);
    }

    private bool ApplyReservationState(RestaurantTable table, DateTime now)
    {
        var hasChanges = false;
        foreach (var reservation in table.Reservations.Where(x => x.Status == ReservationStatus.Aktif))
        {
            if (ShouldCompleteReservation(table, reservation, now))
            {
                reservation.Status = ReservationStatus.Tamamlandi;
                reservationRepository.Update(reservation);
                hasChanges = true;
                continue;
            }

            if (ShouldExpireReservation(table, reservation, now))
            {
                reservation.Status = ReservationStatus.Iptal;
                reservationRepository.Update(reservation);
                hasChanges = true;
            }
        }

        return hasChanges;
    }

    private bool RecalculateBill(Bill bill)
    {
        var originalStatus = bill.Status;
        var originalClosedAt = bill.ClosedAt;
        var originalSubtotal = bill.Subtotal;
        var originalDiscount = bill.DiscountAmount;
        var originalServiceCharge = bill.ServiceCharge;
        var originalVatAmount = bill.VatAmount;
        var originalTotal = bill.TotalAmount;
        var originalPaid = bill.PaidAmount;
        var originalRemaining = bill.RemainingAmount;

        billCalculator.Recalculate(bill);
        billRepository.Update(bill);

        return bill.Status != originalStatus
            || bill.ClosedAt != originalClosedAt
            || bill.Subtotal != originalSubtotal
            || bill.DiscountAmount != originalDiscount
            || bill.ServiceCharge != originalServiceCharge
            || bill.VatAmount != originalVatAmount
            || bill.TotalAmount != originalTotal
            || bill.PaidAmount != originalPaid
            || bill.RemainingAmount != originalRemaining;
    }

    private bool ApplyTableStateFromBill(RestaurantTable table, Bill bill, DateTime now, bool? mergedGroup)
    {
        var hasChanges = false;

        if (bill.Status is BillStatus.Kapandi or BillStatus.Iptal)
        {
            hasChanges |= SetCurrentBillId(table, null);
            hasChanges |= SetTableStatus(table, RestaurantTableStatus.Bos);
            hasChanges |= SetWaiterId(table, null);
            hasChanges |= SetGuestCount(table, 0);
            hasChanges |= SetIsMerged(table, false);
            tableRepository.Update(table);
            return hasChanges;
        }

        hasChanges |= SetCurrentBillId(table, bill.Id);
        hasChanges |= SetWaiterId(table, bill.WaiterId);

        if (table.Id == bill.TableId)
        {
            hasChanges |= SetGuestCount(table, bill.CustomerCount);
        }
        else if (table.CurrentGuestCount <= 0)
        {
            hasChanges |= SetGuestCount(table, Math.Max(1, bill.CustomerCount));
        }

        var targetStatus = bill.Status == BillStatus.OdemeBekliyor
            || (bill.Status == BillStatus.Acik && bill.OpenedAt <= now.AddHours(-2))
                ? RestaurantTableStatus.OdemeBekliyor
                : RestaurantTableStatus.Dolu;

        hasChanges |= SetTableStatus(table, targetStatus);
        if (mergedGroup.HasValue)
        {
            hasChanges |= SetIsMerged(table, mergedGroup.Value);
        }

        if (hasChanges)
        {
            tableRepository.Update(table);
        }

        return hasChanges;
    }

    private bool ResetDetachedTable(RestaurantTable table)
    {
        var hasActiveReservation = table.Reservations.Any(x => x.Status == ReservationStatus.Aktif);
        var hasChanges = false;

        hasChanges |= SetCurrentBillId(table, null);
        hasChanges |= SetTableStatus(table, RestaurantTableStatus.Bos);
        hasChanges |= SetIsMerged(table, false);

        if (!hasActiveReservation)
        {
            hasChanges |= SetWaiterId(table, null);
            hasChanges |= SetGuestCount(table, 0);
        }

        if (hasChanges)
        {
            tableRepository.Update(table);
        }

        return hasChanges;
    }

    private static bool ShouldCompleteReservation(RestaurantTable table, TableReservation reservation, DateTime now)
    {
        if (!table.CurrentBillId.HasValue)
        {
            return false;
        }

        return reservation.ReservationAt <= now.Add(ReservationArrivalWindow);
    }

    private static bool ShouldExpireReservation(RestaurantTable table, TableReservation reservation, DateTime now)
    {
        return !table.CurrentBillId.HasValue
            && reservation.ReservationAt <= now.Subtract(ReservationNoShowGracePeriod);
    }

    private static bool SetCurrentBillId(RestaurantTable table, int? newValue)
    {
        if (table.CurrentBillId == newValue)
        {
            return false;
        }

        table.CurrentBillId = newValue;
        return true;
    }

    private static bool SetWaiterId(RestaurantTable table, int? newValue)
    {
        if (table.WaiterId == newValue)
        {
            return false;
        }

        table.WaiterId = newValue;
        return true;
    }

    private static bool SetGuestCount(RestaurantTable table, int newValue)
    {
        if (table.CurrentGuestCount == newValue)
        {
            return false;
        }

        table.CurrentGuestCount = newValue;
        return true;
    }

    private static bool SetIsMerged(RestaurantTable table, bool newValue)
    {
        if (table.IsMerged == newValue)
        {
            return false;
        }

        table.IsMerged = newValue;
        return true;
    }

    private static bool SetTableStatus(RestaurantTable table, RestaurantTableStatus newValue)
    {
        if (table.Status == newValue)
        {
            return false;
        }

        table.Status = newValue;
        return true;
    }
}

public class TableLifecycleBackgroundService(
    IServiceScopeFactory serviceScopeFactory,
    ILogger<TableLifecycleBackgroundService> logger) : BackgroundService
{
    private static readonly TimeSpan RunInterval = TimeSpan.FromMinutes(1);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = serviceScopeFactory.CreateScope();
                var tableLifecycleService = scope.ServiceProvider.GetRequiredService<ITableLifecycleService>();
                await tableLifecycleService.ReconcileAsync(cancellationToken: stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception exception)
            {
                logger.LogError(exception, "Table lifecycle reconciliation failed.");
            }

            try
            {
                await Task.Delay(RunInterval, stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
        }
    }
}
