using Backend.DTOs;
using Backend.Enums;
using FluentValidation;

namespace Backend.Validators;

public class UpsertPosTerminalRequestValidator : AbstractValidator<UpsertPosTerminalRequest>
{
    public UpsertPosTerminalRequestValidator()
    {
        RuleFor(x => x.BranchId).GreaterThan(0);
        RuleFor(x => x.TerminalNo).NotEmpty().MaximumLength(32);
        RuleFor(x => x.DeviceName).NotEmpty().MaximumLength(128);
        RuleFor(x => x.CashRegisterName).NotEmpty().MaximumLength(64);
        RuleFor(x => x.IpAddress).MaximumLength(64);
        RuleFor(x => x.Model).MaximumLength(64);
        RuleFor(x => x.FirmwareVersion).MaximumLength(32);
    }
}

public class UpdateTerminalStatusRequestValidator : AbstractValidator<UpdateTerminalStatusRequest>
{
    public UpdateTerminalStatusRequestValidator()
    {
        RuleFor(x => x.Status).IsInEnum();
    }
}

public class CashPaymentRequestValidator : AbstractValidator<CashPaymentRequest>
{
    public CashPaymentRequestValidator()
    {
        RuleFor(x => x.BillId).GreaterThan(0);
        RuleFor(x => x.Amount).GreaterThan(0);
    }
}

public class CardPaymentRequestValidator : AbstractValidator<CardPaymentRequest>
{
    public CardPaymentRequestValidator()
    {
        RuleFor(x => x.BillId).GreaterThan(0);
        RuleFor(x => x.TerminalId).GreaterThan(0);
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.CardMaskedPan).MaximumLength(32);
    }
}

public class SplitPaymentPartRequestValidator : AbstractValidator<SplitPaymentPartRequest>
{
    public SplitPaymentPartRequestValidator()
    {
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.Method).Must(x => x is PaymentType.Nakit or PaymentType.Kart);
        RuleFor(x => x.TerminalId)
            .GreaterThan(0)
            .When(x => x.Method == PaymentType.Kart);
    }
}

public class SplitPaymentRequestValidator : AbstractValidator<SplitPaymentRequest>
{
    public SplitPaymentRequestValidator()
    {
        RuleFor(x => x.BillId).GreaterThan(0);
        RuleFor(x => x.Mode).NotEmpty().MaximumLength(32);
        RuleFor(x => x.Parts).NotEmpty();
        RuleForEach(x => x.Parts).SetValidator(new SplitPaymentPartRequestValidator());
    }
}

public class RefundPaymentRequestValidator : AbstractValidator<RefundPaymentRequest>
{
    public RefundPaymentRequestValidator()
    {
        RuleFor(x => x.OriginalPaymentId).GreaterThan(0);
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.Reason).NotEmpty().MaximumLength(128);
        RuleFor(x => x.Description).MaximumLength(256);
        RuleFor(x => x.ApproverName).MaximumLength(128);
    }
}
