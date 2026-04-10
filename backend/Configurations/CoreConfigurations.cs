using Backend.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Configurations;

public class BranchConfiguration : IEntityTypeConfiguration<Branch>
{
    public void Configure(EntityTypeBuilder<Branch> builder)
    {
        builder.ToTable("Branches");
        builder.Property(x => x.Name).HasMaxLength(128).IsRequired();
        builder.Property(x => x.Code).HasMaxLength(32).IsRequired();
        builder.Property(x => x.Address).HasMaxLength(256).IsRequired();
        builder.Property(x => x.Phone).HasMaxLength(32).IsRequired();
        builder.Property(x => x.Email).HasMaxLength(128).IsRequired();
        builder.Property(x => x.TaxNumber).HasMaxLength(32).IsRequired();
        builder.Property(x => x.MerchantNumber).HasMaxLength(32).IsRequired();
        builder.HasIndex(x => x.Code).IsUnique();
    }
}

public class RestaurantTableConfiguration : IEntityTypeConfiguration<RestaurantTable>
{
    public void Configure(EntityTypeBuilder<RestaurantTable> builder)
    {
        builder.ToTable("RestaurantTables");
        builder.Property(x => x.TableNo).HasMaxLength(32).IsRequired();
        builder.Property(x => x.AreaName).HasMaxLength(64).IsRequired();
        builder.HasIndex(x => new { x.BranchId, x.TableNo }).IsUnique();

        builder.HasOne(x => x.Branch).WithMany(x => x.Tables).HasForeignKey(x => x.BranchId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.Waiter).WithMany(x => x.AssignedTables).HasForeignKey(x => x.WaiterId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.CurrentBill).WithMany().HasForeignKey(x => x.CurrentBillId).OnDelete(DeleteBehavior.Restrict);
    }
}

public class TableReservationConfiguration : IEntityTypeConfiguration<TableReservation>
{
    public void Configure(EntityTypeBuilder<TableReservation> builder)
    {
        builder.ToTable("TableReservations");
        builder.Property(x => x.CustomerName).HasMaxLength(128).IsRequired();
        builder.Property(x => x.PhoneNumber).HasMaxLength(24).IsRequired();
        builder.Property(x => x.Notes).HasMaxLength(256);
        builder.HasOne(x => x.RestaurantTable).WithMany(x => x.Reservations).HasForeignKey(x => x.RestaurantTableId).OnDelete(DeleteBehavior.Cascade);
    }
}

public class ProductCategoryConfiguration : IEntityTypeConfiguration<ProductCategory>
{
    public void Configure(EntityTypeBuilder<ProductCategory> builder)
    {
        builder.ToTable("ProductCategories");
        builder.Property(x => x.Name).HasMaxLength(64).IsRequired();
        builder.HasIndex(x => x.Name).IsUnique();
    }
}

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("Products");
        builder.Property(x => x.Name).HasMaxLength(128).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(512);
        builder.Property(x => x.Price).HasPrecision(18, 2);
        builder.Property(x => x.VatRate).HasPrecision(5, 2);
        builder.HasOne(x => x.Category).WithMany(x => x.Products).HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.Restrict);
    }
}
