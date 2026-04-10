using Backend.DTOs;
using FluentValidation;

namespace Backend.Validators;

public class OpenShiftRequestValidator : AbstractValidator<OpenShiftRequest>
{
    public OpenShiftRequestValidator()
    {
        RuleFor(x => x.BranchId).GreaterThan(0);
        RuleFor(x => x.OpeningCashAmount).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Note).MaximumLength(256);
    }
}

public class CloseShiftRequestValidator : AbstractValidator<CloseShiftRequest>
{
    public CloseShiftRequestValidator()
    {
        RuleFor(x => x.ClosingCashAmount).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Note).MaximumLength(256);
    }
}

public class UpsertPrinterSettingRequestValidator : AbstractValidator<UpsertPrinterSettingRequest>
{
    public UpsertPrinterSettingRequestValidator()
    {
        RuleFor(x => x.BranchId).GreaterThan(0);
        RuleFor(x => x.PrinterName).NotEmpty().MaximumLength(128);
        RuleFor(x => x.IpAddress).NotEmpty().MaximumLength(64);
    }
}

public class UpsertAppSettingRequestValidator : AbstractValidator<UpsertAppSettingRequest>
{
    public UpsertAppSettingRequestValidator()
    {
        RuleFor(x => x.BranchId).GreaterThan(0);
        RuleFor(x => x.Key).NotEmpty().MaximumLength(64);
        RuleFor(x => x.Value).NotEmpty().MaximumLength(256);
        RuleFor(x => x.Group).NotEmpty().MaximumLength(64);
        RuleFor(x => x.Description).MaximumLength(256);
    }
}

public class UpdateRolePermissionsRequestValidator : AbstractValidator<UpdateRolePermissionsRequest>
{
    public UpdateRolePermissionsRequestValidator()
    {
        RuleFor(x => x.Permissions).NotEmpty();
        RuleForEach(x => x.Permissions).ChildRules(item =>
        {
            item.RuleFor(x => x.PermissionId).GreaterThan(0);
        });
    }
}
