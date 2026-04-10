using Backend.DTOs;
using Backend.Helpers;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Authorize]
[Route("api/transactions")]
public class TransactionsController(IPaymentService paymentService) : ControllerBase
{
    [HttpGet("history")]
    public async Task<ActionResult<List<TransactionHistoryItemDto>>> History(CancellationToken cancellationToken) =>
        Ok(await paymentService.GetTransactionHistoryAsync(cancellationToken));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TransactionDetailDto>> Detail(int id, CancellationToken cancellationToken) =>
        Ok(await paymentService.GetTransactionDetailAsync(id, cancellationToken));
}
