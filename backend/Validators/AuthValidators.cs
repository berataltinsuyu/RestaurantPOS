using Backend.DTOs;
using FluentValidation;

namespace Backend.Validators;

public class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.UserName).NotEmpty().MaximumLength(64);
        RuleFor(x => x.Password).NotEmpty().MaximumLength(128);
        RuleFor(x => x)
            .Must(x => x.BranchId.HasValue || !string.IsNullOrWhiteSpace(x.BranchCode))
            .WithMessage("BranchId or BranchCode must be provided.");
    }
}
