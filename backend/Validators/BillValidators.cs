using Backend.DTOs;
using FluentValidation;

namespace Backend.Validators;

public class CreateBillRequestValidator : AbstractValidator<CreateBillRequest>
{
    public CreateBillRequestValidator()
    {
        RuleFor(x => x.BranchId).GreaterThan(0);
        RuleFor(x => x.TableId).GreaterThan(0);
        RuleFor(x => x.WaiterId).GreaterThan(0);
        RuleFor(x => x.CustomerCount).InclusiveBetween(1, 30);
        RuleFor(x => x.Note).MaximumLength(512);
    }
}

public class UpdateBillRequestValidator : AbstractValidator<UpdateBillRequest>
{
    public UpdateBillRequestValidator()
    {
        RuleFor(x => x.CustomerCount).InclusiveBetween(1, 30);
        RuleFor(x => x.Note).MaximumLength(512);
    }
}

public class ApplyDiscountRequestValidator : AbstractValidator<ApplyDiscountRequest>
{
    public ApplyDiscountRequestValidator()
    {
        RuleFor(x => x.Amount).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Reason).MaximumLength(256);
    }
}

public class UpdateServiceChargeRequestValidator : AbstractValidator<UpdateServiceChargeRequest>
{
    public UpdateServiceChargeRequestValidator()
    {
        RuleFor(x => x.Rate).InclusiveBetween(0, 1);
    }
}

public class AddBillItemRequestValidator : AbstractValidator<AddBillItemRequest>
{
    public AddBillItemRequestValidator()
    {
        RuleFor(x => x.ProductId).GreaterThan(0);
        RuleFor(x => x.Quantity).InclusiveBetween(1, 100);
        RuleFor(x => x.Note).MaximumLength(256);
    }
}

public class UpdateBillItemRequestValidator : AbstractValidator<UpdateBillItemRequest>
{
    public UpdateBillItemRequestValidator()
    {
        RuleFor(x => x.Quantity).InclusiveBetween(1, 100);
        RuleFor(x => x.Note).MaximumLength(256);
    }
}

public class UpdateBillItemStatusRequestValidator : AbstractValidator<UpdateBillItemStatusRequest>
{
    public UpdateBillItemStatusRequestValidator()
    {
        RuleFor(x => x.Status).IsInEnum();
        RuleFor(x => x.Reason).MaximumLength(256);
    }
}

public class ComplimentaryApprovalRequestValidator : AbstractValidator<ComplimentaryApprovalRequest>
{
    public ComplimentaryApprovalRequestValidator()
    {
        RuleFor(x => x.BillItemIds).NotEmpty();
        RuleForEach(x => x.BillItemIds).GreaterThan(0);
        RuleFor(x => x.Reason).NotEmpty().MaximumLength(128);
        RuleFor(x => x.ApproverName).NotEmpty().MaximumLength(128);
    }
}
