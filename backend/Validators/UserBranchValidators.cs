using Backend.DTOs;
using FluentValidation;

namespace Backend.Validators;

public class CreateUserRequestValidator : AbstractValidator<CreateUserRequest>
{
    public CreateUserRequestValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(128);
        RuleFor(x => x.UserName).NotEmpty().MaximumLength(64);
        RuleFor(x => x.Password).NotEmpty().MinimumLength(6).MaximumLength(128);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(128);
        RuleFor(x => x.RoleId).GreaterThan(0);
    }
}

public class UpdateUserRequestValidator : AbstractValidator<UpdateUserRequest>
{
    public UpdateUserRequestValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(128);
        RuleFor(x => x.UserName).NotEmpty().MaximumLength(64);
        RuleFor(x => x.Password).MinimumLength(6).MaximumLength(128).When(x => !string.IsNullOrWhiteSpace(x.Password));
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(128);
        RuleFor(x => x.RoleId).GreaterThan(0);
    }
}

public class UpsertBranchRequestValidator : AbstractValidator<UpsertBranchRequest>
{
    public UpsertBranchRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(128);
        RuleFor(x => x.Code).NotEmpty().MaximumLength(32);
        RuleFor(x => x.Address).NotEmpty().MaximumLength(256);
        RuleFor(x => x.Phone).NotEmpty().MaximumLength(32);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(128);
        RuleFor(x => x.TaxNumber).NotEmpty().MaximumLength(32);
        RuleFor(x => x.MerchantNumber).NotEmpty().MaximumLength(32);
    }
}
