using Backend.DTOs;
using FluentValidation;

namespace Backend.Validators;

public class UpsertProductCategoryRequestValidator : AbstractValidator<UpsertProductCategoryRequest>
{
    public UpsertProductCategoryRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(64);
    }
}

public class UpsertProductRequestValidator : AbstractValidator<UpsertProductRequest>
{
    public UpsertProductRequestValidator()
    {
        RuleFor(x => x.CategoryId).GreaterThan(0);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(128);
        RuleFor(x => x.Description).MaximumLength(512);
        RuleFor(x => x.Price).GreaterThan(0);
        RuleFor(x => x.VatRate).InclusiveBetween(0, 100);
        RuleFor(x => x)
            .Must(x => !x.IsOutOfStock || (x.IsActive && x.IsMenuActive))
            .WithMessage("Tükendi durumu yalnızca aktif ve menüde olan ürünler için kullanılabilir.");
    }
}
