using Backend.DTOs;
using Backend.Entities;
using Backend.Helpers;
using Backend.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public interface ISettingsService
{
    Task<BranchSummaryDto> GetBusinessSettingsAsync(int branchId, CancellationToken cancellationToken = default);
    Task<BranchSummaryDto> UpdateBusinessSettingsAsync(int branchId, UpsertBranchRequest request, CancellationToken cancellationToken = default);

    Task<List<PrinterSettingDto>> GetPrintersAsync(int? branchId = null, CancellationToken cancellationToken = default);
    Task<PrinterSettingDto> CreatePrinterAsync(UpsertPrinterSettingRequest request, CancellationToken cancellationToken = default);
    Task<PrinterSettingDto> UpdatePrinterAsync(int id, UpsertPrinterSettingRequest request, CancellationToken cancellationToken = default);
    Task DeletePrinterAsync(int id, CancellationToken cancellationToken = default);

    Task<List<AppSettingDto>> GetAppSettingsAsync(int? branchId = null, CancellationToken cancellationToken = default);
    Task<AppSettingDto> CreateAppSettingAsync(UpsertAppSettingRequest request, CancellationToken cancellationToken = default);
    Task<AppSettingDto> UpdateAppSettingAsync(int id, UpsertAppSettingRequest request, CancellationToken cancellationToken = default);
    Task DeleteAppSettingAsync(int id, CancellationToken cancellationToken = default);
}

public class SettingsService(
    IRepository<Branch> branchRepository,
    IRepository<PrinterSetting> printerRepository,
    IRepository<AppSetting> appSettingRepository,
    ICurrentUserService currentUserService,
    IAuditLogService auditLogService,
    IUnitOfWork unitOfWork) : ISettingsService
{
    public async Task<BranchSummaryDto> GetBusinessSettingsAsync(int branchId, CancellationToken cancellationToken = default)
    {
        var branch = await branchRepository.GetByIdAsync(branchId, cancellationToken)
            ?? throw new NotFoundException("Branch not found.");

        return BranchService.MapBranch(branch);
    }

    public async Task<BranchSummaryDto> UpdateBusinessSettingsAsync(int branchId, UpsertBranchRequest request, CancellationToken cancellationToken = default)
    {
        var branch = await branchRepository.GetByIdAsync(branchId, cancellationToken)
            ?? throw new NotFoundException("Branch not found.");

        branch.Name = request.Name;
        branch.Code = request.Code;
        branch.Address = request.Address;
        branch.Phone = request.Phone;
        branch.Email = request.Email;
        branch.TaxNumber = request.TaxNumber;
        branch.MerchantNumber = request.MerchantNumber;
        branch.IsActive = request.IsActive;

        branchRepository.Update(branch);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        await auditLogService.CreateAsync(currentUserService.UserId, "UpdateBusinessSettings", nameof(Branch), branch.Id.ToString(), $"Business settings for branch {branch.Name} updated.", currentUserService.IpAddress, cancellationToken);
        return BranchService.MapBranch(branch);
    }

    public async Task<List<PrinterSettingDto>> GetPrintersAsync(int? branchId = null, CancellationToken cancellationToken = default)
    {
        var query = printerRepository.Query().AsNoTracking();
        if (branchId.HasValue)
        {
            query = query.Where(x => x.BranchId == branchId.Value);
        }

        var printers = await query.OrderBy(x => x.PrinterName).ToListAsync(cancellationToken);
        return printers.Select(MapPrinter).ToList();
    }

    public async Task<PrinterSettingDto> CreatePrinterAsync(UpsertPrinterSettingRequest request, CancellationToken cancellationToken = default)
    {
        var printer = new PrinterSetting
        {
            BranchId = request.BranchId,
            PrinterName = request.PrinterName,
            IpAddress = request.IpAddress,
            AutoPrintReceipt = request.AutoPrintReceipt,
            PrintKitchenCopy = request.PrintKitchenCopy,
            PrintLogo = request.PrintLogo,
            IsActive = request.IsActive
        };

        await printerRepository.AddAsync(printer, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        await auditLogService.CreateAsync(currentUserService.UserId, "Create", nameof(PrinterSetting), printer.Id.ToString(), $"Printer {printer.PrinterName} created.", currentUserService.IpAddress, cancellationToken);
        return MapPrinter(printer);
    }

    public async Task<PrinterSettingDto> UpdatePrinterAsync(int id, UpsertPrinterSettingRequest request, CancellationToken cancellationToken = default)
    {
        var printer = await printerRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Printer setting not found.");

        printer.BranchId = request.BranchId;
        printer.PrinterName = request.PrinterName;
        printer.IpAddress = request.IpAddress;
        printer.AutoPrintReceipt = request.AutoPrintReceipt;
        printer.PrintKitchenCopy = request.PrintKitchenCopy;
        printer.PrintLogo = request.PrintLogo;
        printer.IsActive = request.IsActive;

        printerRepository.Update(printer);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        await auditLogService.CreateAsync(currentUserService.UserId, "Update", nameof(PrinterSetting), printer.Id.ToString(), $"Printer {printer.PrinterName} updated.", currentUserService.IpAddress, cancellationToken);
        return MapPrinter(printer);
    }

    public async Task DeletePrinterAsync(int id, CancellationToken cancellationToken = default)
    {
        var printer = await printerRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Printer setting not found.");

        printerRepository.Remove(printer);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        await auditLogService.CreateAsync(currentUserService.UserId, "Delete", nameof(PrinterSetting), printer.Id.ToString(), $"Printer {printer.PrinterName} deleted.", currentUserService.IpAddress, cancellationToken);
    }

    public async Task<List<AppSettingDto>> GetAppSettingsAsync(int? branchId = null, CancellationToken cancellationToken = default)
    {
        var query = appSettingRepository.Query().AsNoTracking();
        if (branchId.HasValue)
        {
            query = query.Where(x => x.BranchId == branchId.Value);
        }

        var settings = await query.OrderBy(x => x.Group).ThenBy(x => x.Key).ToListAsync(cancellationToken);
        return settings.Select(MapAppSetting).ToList();
    }

    public async Task<AppSettingDto> CreateAppSettingAsync(UpsertAppSettingRequest request, CancellationToken cancellationToken = default)
    {
        var exists = await appSettingRepository.Query()
            .AnyAsync(x => x.BranchId == request.BranchId && x.Key == request.Key, cancellationToken);
        if (exists)
        {
            throw new ConflictException("App setting key already exists.");
        }

        var setting = new AppSetting
        {
            BranchId = request.BranchId,
            Key = request.Key,
            Value = request.Value,
            Group = request.Group,
            Description = request.Description,
            IsActive = request.IsActive
        };

        await appSettingRepository.AddAsync(setting, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        await auditLogService.CreateAsync(currentUserService.UserId, "Create", nameof(AppSetting), setting.Id.ToString(), $"App setting {setting.Key} created.", currentUserService.IpAddress, cancellationToken);
        return MapAppSetting(setting);
    }

    public async Task<AppSettingDto> UpdateAppSettingAsync(int id, UpsertAppSettingRequest request, CancellationToken cancellationToken = default)
    {
        var setting = await appSettingRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("App setting not found.");

        var exists = await appSettingRepository.Query()
            .AnyAsync(x => x.BranchId == request.BranchId && x.Key == request.Key && x.Id != id, cancellationToken);
        if (exists)
        {
            throw new ConflictException("App setting key already exists.");
        }

        setting.BranchId = request.BranchId;
        setting.Key = request.Key;
        setting.Value = request.Value;
        setting.Group = request.Group;
        setting.Description = request.Description;
        setting.IsActive = request.IsActive;

        appSettingRepository.Update(setting);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        await auditLogService.CreateAsync(currentUserService.UserId, "Update", nameof(AppSetting), setting.Id.ToString(), $"App setting {setting.Key} updated.", currentUserService.IpAddress, cancellationToken);
        return MapAppSetting(setting);
    }

    public async Task DeleteAppSettingAsync(int id, CancellationToken cancellationToken = default)
    {
        var setting = await appSettingRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("App setting not found.");

        appSettingRepository.Remove(setting);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        await auditLogService.CreateAsync(currentUserService.UserId, "Delete", nameof(AppSetting), setting.Id.ToString(), $"App setting {setting.Key} deleted.", currentUserService.IpAddress, cancellationToken);
    }

    private static PrinterSettingDto MapPrinter(PrinterSetting printer) => new()
    {
        Id = printer.Id,
        BranchId = printer.BranchId,
        PrinterName = printer.PrinterName,
        IpAddress = printer.IpAddress,
        AutoPrintReceipt = printer.AutoPrintReceipt,
        PrintKitchenCopy = printer.PrintKitchenCopy,
        PrintLogo = printer.PrintLogo,
        IsActive = printer.IsActive
    };

    private static AppSettingDto MapAppSetting(AppSetting setting) => new()
    {
        Id = setting.Id,
        BranchId = setting.BranchId,
        Key = setting.Key,
        Value = setting.Value,
        Group = setting.Group,
        Description = setting.Description,
        IsActive = setting.IsActive
    };
}
