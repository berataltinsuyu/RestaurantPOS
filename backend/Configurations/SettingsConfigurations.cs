using Backend.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Configurations;

public class PrinterSettingConfiguration : IEntityTypeConfiguration<PrinterSetting>
{
    public void Configure(EntityTypeBuilder<PrinterSetting> builder)
    {
        builder.ToTable("PrinterSettings");
        builder.Property(x => x.PrinterName).HasMaxLength(128).IsRequired();
        builder.Property(x => x.IpAddress).HasMaxLength(64).IsRequired();
        builder.HasOne(x => x.Branch).WithMany(x => x.PrinterSettings).HasForeignKey(x => x.BranchId).OnDelete(DeleteBehavior.Cascade);
    }
}

public class AppSettingConfiguration : IEntityTypeConfiguration<AppSetting>
{
    public void Configure(EntityTypeBuilder<AppSetting> builder)
    {
        builder.ToTable("AppSettings");
        builder.Property(x => x.Key).HasMaxLength(64).IsRequired();
        builder.Property(x => x.Value).HasMaxLength(256).IsRequired();
        builder.Property(x => x.Group).HasMaxLength(64).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(256);
        builder.HasIndex(x => new { x.BranchId, x.Key }).IsUnique();
        builder.HasOne(x => x.Branch).WithMany(x => x.AppSettings).HasForeignKey(x => x.BranchId).OnDelete(DeleteBehavior.Cascade);
    }
}
