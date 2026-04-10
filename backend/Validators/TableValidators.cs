using Backend.DTOs;
using FluentValidation;

namespace Backend.Validators;

public class CreateTableRequestValidator : AbstractValidator<CreateTableRequest>
{
    public CreateTableRequestValidator()
    {
        RuleFor(x => x.BranchId).GreaterThan(0);
        RuleFor(x => x.TableNo).NotEmpty().MaximumLength(32);
        RuleFor(x => x.Capacity).InclusiveBetween(1, 30);
        RuleFor(x => x.AreaName).NotEmpty().MaximumLength(64);
    }
}

public class UpdateTableRequestValidator : AbstractValidator<UpdateTableRequest>
{
    public UpdateTableRequestValidator()
    {
        RuleFor(x => x.TableNo).NotEmpty().MaximumLength(32);
        RuleFor(x => x.Capacity).InclusiveBetween(1, 30);
        RuleFor(x => x.AreaName).NotEmpty().MaximumLength(64);
    }
}

public class UpdateTableStatusRequestValidator : AbstractValidator<UpdateTableStatusRequest>
{
    public UpdateTableStatusRequestValidator()
    {
        RuleFor(x => x.Status).IsInEnum();
    }
}

public class AssignWaiterRequestValidator : AbstractValidator<AssignWaiterRequest>
{
    public AssignWaiterRequestValidator()
    {
        RuleFor(x => x.WaiterId).GreaterThan(0);
        RuleFor(x => x.Reason).MaximumLength(256);
    }
}

public class OpenTableRequestValidator : AbstractValidator<OpenTableRequest>
{
    public OpenTableRequestValidator()
    {
        RuleFor(x => x.WaiterId).GreaterThan(0);
        RuleFor(x => x.GuestCount).InclusiveBetween(1, 30);
        RuleFor(x => x.Note).MaximumLength(256);
    }
}

public class MoveTableRequestValidator : AbstractValidator<MoveTableRequest>
{
    public MoveTableRequestValidator()
    {
        RuleFor(x => x.TargetTableId).GreaterThan(0);
    }
}

public class MergeTablesRequestValidator : AbstractValidator<MergeTablesRequest>
{
    public MergeTablesRequestValidator()
    {
        RuleFor(x => x.TargetTableIds).NotEmpty();
        RuleForEach(x => x.TargetTableIds).GreaterThan(0);
        RuleFor(x => x.MergedName).MaximumLength(64);
    }
}

public class SplitTableRequestValidator : AbstractValidator<SplitTableRequest>
{
    public SplitTableRequestValidator()
    {
        RuleFor(x => x.NewTableNo).NotEmpty().MaximumLength(32);
        RuleFor(x => x.BillItemIds).NotEmpty();
        RuleForEach(x => x.BillItemIds).GreaterThan(0);
        RuleFor(x => x.AreaName).NotEmpty().MaximumLength(64);
    }
}

public class ReservationRequestValidator : AbstractValidator<ReservationRequest>
{
    public ReservationRequestValidator()
    {
        RuleFor(x => x.CustomerName).NotEmpty().MaximumLength(128);
        RuleFor(x => x.PhoneNumber).NotEmpty().MaximumLength(24);
        RuleFor(x => x.GuestCount).InclusiveBetween(1, 20);
        RuleFor(x => x.ReservationAt).GreaterThan(DateTime.UtcNow.AddMinutes(-1));
        RuleFor(x => x.Notes).MaximumLength(256);
    }
}
