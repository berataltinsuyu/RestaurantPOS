using Backend.DTOs;
using Backend.Helpers;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Authorize(Roles = $"{RoleNames.Cashier},{RoleNames.BranchManager},{RoleNames.SystemAdministrator}")]
[Route("api/payments")]
public class PaymentsController(IPaymentService paymentService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<PaymentDto>>> GetAll(CancellationToken cancellationToken) =>
        Ok(await paymentService.GetAllAsync(cancellationToken));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<PaymentDto>> GetById(int id, CancellationToken cancellationToken) =>
        Ok(await paymentService.GetByIdAsync(id, cancellationToken));

    [HttpGet("bill/{billId:int}")]
    public async Task<ActionResult<List<PaymentDto>>> GetByBill(int billId, CancellationToken cancellationToken) =>
        Ok(await paymentService.GetByBillIdAsync(billId, cancellationToken));

    [HttpPost("cash")]
    public async Task<ActionResult<PaymentDto>> Cash([FromBody] CashPaymentRequest request, CancellationToken cancellationToken) =>
        Ok(await paymentService.CreateCashPaymentAsync(request, cancellationToken));

    [HttpPost("card")]
    public async Task<ActionResult<PaymentDto>> Card([FromBody] CardPaymentRequest request, CancellationToken cancellationToken) =>
        Ok(await paymentService.CreateCardPaymentAsync(request, cancellationToken));

    [HttpPost("split")]
    public async Task<ActionResult<SplitPaymentResultDto>> Split([FromBody] SplitPaymentRequest request, CancellationToken cancellationToken) =>
        Ok(await paymentService.CreateSplitPaymentAsync(request, cancellationToken));

    [HttpPost("refund")]
    public async Task<ActionResult<PaymentDto>> Refund([FromBody] RefundPaymentRequest request, CancellationToken cancellationToken) =>
        Ok(await paymentService.CreateRefundAsync(request, cancellationToken));

    [HttpPost("{id:int}/retry")]
    public async Task<ActionResult<PaymentDto>> Retry(int id, CancellationToken cancellationToken) =>
        Ok(await paymentService.RetryAsync(id, cancellationToken));

    [HttpPost("{id:int}/cancel")]
    public async Task<ActionResult<PaymentDto>> Cancel(int id, CancellationToken cancellationToken) =>
        Ok(await paymentService.CancelAsync(id, cancellationToken));
}
