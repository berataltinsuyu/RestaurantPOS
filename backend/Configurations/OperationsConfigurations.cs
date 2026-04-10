using Backend.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Configurations;

public class BillConfiguration : IEntityTypeConfiguration<Bill>
{
    public void Configure(EntityTypeBuilder<Bill> builder)
    {
        builder.ToTable("Bills");
        builder.Property(x => x.BillNo).HasMaxLength(32).IsRequired();
        builder.Property(x => x.Note).HasMaxLength(512);
        builder.Property(x => x.Subtotal).HasPrecision(18, 2);
        builder.Property(x => x.ManualDiscountAmount).HasPrecision(18, 2);
        builder.Property(x => x.DiscountAmount).HasPrecision(18, 2);
        builder.Property(x => x.ServiceChargeRate).HasPrecision(6, 4);
        builder.Property(x => x.ServiceCharge).HasPrecision(18, 2);
        builder.Property(x => x.VatAmount).HasPrecision(18, 2);
        builder.Property(x => x.TotalAmount).HasPrecision(18, 2);
        builder.Property(x => x.PaidAmount).HasPrecision(18, 2);
        builder.Property(x => x.RemainingAmount).HasPrecision(18, 2);
        builder.HasIndex(x => x.BillNo).IsUnique();

        builder.HasOne(x => x.Branch).WithMany(x => x.Bills).HasForeignKey(x => x.BranchId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Table).WithMany(x => x.Bills).HasForeignKey(x => x.TableId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Waiter).WithMany(x => x.Bills).HasForeignKey(x => x.WaiterId).OnDelete(DeleteBehavior.Restrict);
    }
}

public class BillItemConfiguration : IEntityTypeConfiguration<BillItem>
{
    public void Configure(EntityTypeBuilder<BillItem> builder)
    {
        builder.ToTable("BillItems");
        builder.Property(x => x.ProductNameSnapshot).HasMaxLength(128).IsRequired();
        builder.Property(x => x.UnitPrice).HasPrecision(18, 2);
        builder.Property(x => x.VatRate).HasPrecision(5, 2);
        builder.Property(x => x.LineTotal).HasPrecision(18, 2);
        builder.Property(x => x.Note).HasMaxLength(256);

        builder.HasOne(x => x.Bill).WithMany(x => x.Items).HasForeignKey(x => x.BillId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.Product).WithMany(x => x.BillItems).HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);
    }
}

public class PosTerminalConfiguration : IEntityTypeConfiguration<PosTerminal>
{
    public void Configure(EntityTypeBuilder<PosTerminal> builder)
    {
        builder.ToTable("PosTerminals");
        builder.Property(x => x.TerminalNo).HasMaxLength(32).IsRequired();
        builder.Property(x => x.DeviceName).HasMaxLength(128).IsRequired();
        builder.Property(x => x.CashRegisterName).HasMaxLength(64).IsRequired();
        builder.Property(x => x.IpAddress).HasMaxLength(64);
        builder.Property(x => x.Model).HasMaxLength(64);
        builder.Property(x => x.FirmwareVersion).HasMaxLength(32);
        builder.HasIndex(x => new { x.BranchId, x.TerminalNo }).IsUnique();
        builder.HasOne(x => x.Branch).WithMany(x => x.PosTerminals).HasForeignKey(x => x.BranchId).OnDelete(DeleteBehavior.Cascade);
    }
}

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.ToTable("Payments");
        builder.Property(x => x.Amount).HasPrecision(18, 2);
        builder.Property(x => x.ReferenceNo).HasMaxLength(64).IsRequired();
        builder.Property(x => x.BankApprovalCode).HasMaxLength(32);
        builder.Property(x => x.CardMaskedPan).HasMaxLength(32);
        builder.Property(x => x.ErrorCode).HasMaxLength(32);
        builder.Property(x => x.ErrorMessage).HasMaxLength(256);
        builder.Property(x => x.SplitPaymentGroupId).HasMaxLength(64);
        builder.Property(x => x.RefundReason).HasMaxLength(256);
        builder.Property(x => x.Notes).HasMaxLength(512);

        builder.HasOne(x => x.Bill).WithMany(x => x.Payments).HasForeignKey(x => x.BillId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Terminal).WithMany(x => x.Payments).HasForeignKey(x => x.TerminalId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.CreatedByUser).WithMany(x => x.Payments).HasForeignKey(x => x.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.OriginalPayment).WithMany(x => x.RefundPayments).HasForeignKey(x => x.OriginalPaymentId).OnDelete(DeleteBehavior.Restrict);
    }
}

public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.ToTable("AuditLogs");
        builder.Property(x => x.Action).HasMaxLength(64).IsRequired();
        builder.Property(x => x.EntityName).HasMaxLength(64).IsRequired();
        builder.Property(x => x.EntityId).HasMaxLength(64).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(512).IsRequired();
        builder.Property(x => x.IpAddress).HasMaxLength(64);
        builder.HasOne(x => x.User).WithMany(x => x.AuditLogs).HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Restrict);
    }
}

public class ShiftConfiguration : IEntityTypeConfiguration<Shift>
{
    public void Configure(EntityTypeBuilder<Shift> builder)
    {
        builder.ToTable("Shifts");
        builder.Property(x => x.OpeningCashAmount).HasPrecision(18, 2);
        builder.Property(x => x.ClosingCashAmount).HasPrecision(18, 2);
        builder.Property(x => x.Note).HasMaxLength(256);
        builder.HasOne(x => x.Branch).WithMany(x => x.Shifts).HasForeignKey(x => x.BranchId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.User).WithMany(x => x.Shifts).HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Restrict);
    }
}
