using Backend.DTOs;
using Backend.Helpers;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Authorize]
[Route("api/payments")]
public class PaymentsController(IPaymentService paymentService) : ControllerBase
{
    [Authorize(Roles = RoleNames.CashierManagerAdministratorRoles)]
    [HttpGet]
    public async Task<ActionResult<List<PaymentDto>>> GetAll(CancellationToken cancellationToken) =>
        Ok(await paymentService.GetAllAsync(cancellationToken));

    [Authorize(Roles = RoleNames.CashierManagerAdministratorRoles)]
    [HttpGet("{id:int}")]
    public async Task<ActionResult<PaymentDto>> GetById(int id, CancellationToken cancellationToken) =>
        Ok(await paymentService.GetByIdAsync(id, cancellationToken));

    [Authorize(Roles = RoleNames.CashierManagerAdministratorRoles)]
    [HttpGet("bill/{billId:int}")]
    public async Task<ActionResult<List<PaymentDto>>> GetByBill(int billId, CancellationToken cancellationToken) =>
        Ok(await paymentService.GetByBillIdAsync(billId, cancellationToken));

    [Authorize(Roles = RoleNames.PaymentOperatorRoles)]
    [HttpPost("cash")]
    public async Task<ActionResult<PaymentDto>> Cash([FromBody] CashPaymentRequest request, CancellationToken cancellationToken) =>
        Ok(await paymentService.CreateCashPaymentAsync(request, cancellationToken));

    [Authorize(Roles = RoleNames.PaymentOperatorRoles)]
    [HttpPost("card")]
    public async Task<ActionResult<PaymentDto>> Card([FromBody] CardPaymentRequest request, CancellationToken cancellationToken) =>
        Ok(await paymentService.CreateCardPaymentAsync(request, cancellationToken));

    [Authorize(Roles = RoleNames.PaymentOperatorRoles)]
    [HttpPost("split")]
    public async Task<ActionResult<SplitPaymentResultDto>> Split([FromBody] SplitPaymentRequest request, CancellationToken cancellationToken) =>
        Ok(await paymentService.CreateSplitPaymentAsync(request, cancellationToken));

    [Authorize(Roles = RoleNames.CashierManagerAdministratorRoles)]
    [HttpPost("refund")]
    public async Task<ActionResult<PaymentDto>> Refund([FromBody] RefundPaymentRequest request, CancellationToken cancellationToken) =>
        Ok(await paymentService.CreateRefundAsync(request, cancellationToken));

    [Authorize(Roles = RoleNames.CashierManagerAdministratorRoles)]
    [HttpPost("{id:int}/retry")]
    public async Task<ActionResult<PaymentDto>> Retry(int id, CancellationToken cancellationToken) =>
        Ok(await paymentService.RetryAsync(id, cancellationToken));

    [Authorize(Roles = RoleNames.CashierManagerAdministratorRoles)]
    [HttpPost("{id:int}/cancel")]
    public async Task<ActionResult<PaymentDto>> Cancel(int id, CancellationToken cancellationToken) =>
        Ok(await paymentService.CancelAsync(id, cancellationToken));
}
