using Backend.Entities;
using Backend.Enums;

namespace Backend.Helpers;

public interface IBillCalculator
{
    void Recalculate(Bill bill);
}

public class BillCalculator : IBillCalculator
{
    private static readonly TimeSpan AutomaticPaymentPendingThreshold = TimeSpan.FromHours(2);

    public void Recalculate(Bill bill)
    {
        var allNonCancelledItems = bill.Items.Where(x => x.Status != BillItemStatus.Iptal).ToList();
        var complimentaryTotal = bill.Items
            .Where(x => x.Status == BillItemStatus.Ikram)
            .Sum(x => x.LineTotal);

        bill.Subtotal = Round(allNonCancelledItems.Sum(x => x.LineTotal));
        bill.DiscountAmount = Round(bill.ManualDiscountAmount + complimentaryTotal);

        var chargeableItems = bill.Items.Where(x => x.Status is not BillItemStatus.Iptal and not BillItemStatus.Ikram).ToList();
        var chargeableSubtotal = Math.Max(0m, bill.Subtotal - bill.DiscountAmount);

        bill.ServiceCharge = Round(chargeableSubtotal * bill.ServiceChargeRate);
        bill.VatAmount = Round(chargeableItems.Sum(x => x.LineTotal * (x.VatRate / 100m)));

        var successfulPayments = bill.Payments.Where(x => x.Status == PaymentStatus.Basarili).ToList();
        var receivedAmount = successfulPayments
            .Where(x => x.PaymentType != PaymentType.Iade)
            .Sum(x => x.Amount);
        var refundedAmount = successfulPayments
            .Where(x => x.PaymentType == PaymentType.Iade)
            .Sum(x => x.Amount);

        bill.TotalAmount = Round(chargeableSubtotal + bill.ServiceCharge + bill.VatAmount);
        bill.PaidAmount = Round(receivedAmount - refundedAmount);
        bill.RemainingAmount = Round(Math.Max(0m, bill.TotalAmount - bill.PaidAmount));

        if (bill.Status == BillStatus.Iptal)
        {
            bill.RemainingAmount = 0;
            bill.PaidAmount = 0;
            return;
        }

        var shouldMoveToPaymentPending = bill.TotalAmount > 0
            && bill.RemainingAmount > 0
            && bill.OpenedAt <= DateTime.UtcNow.Subtract(AutomaticPaymentPendingThreshold);

        if (bill.TotalAmount > 0 && bill.RemainingAmount == 0)
        {
            bill.Status = BillStatus.Kapandi;
            bill.ClosedAt ??= DateTime.UtcNow;
        }
        else if (shouldMoveToPaymentPending || bill.PaidAmount > 0 || bill.Payments.Any(x => x.Status == PaymentStatus.PosaGonderildi))
        {
            bill.Status = BillStatus.OdemeBekliyor;
            bill.ClosedAt = null;
        }
        else
        {
            bill.Status = BillStatus.Acik;
            bill.ClosedAt = null;
        }
    }

    private static decimal Round(decimal value) => Math.Round(value, 2, MidpointRounding.AwayFromZero);
}
