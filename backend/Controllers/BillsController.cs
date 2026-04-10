using Backend.DTOs;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Authorize]
[Route("api/bills")]
public class BillsController(IBillService billService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<BillSummaryDto>>> GetAll(CancellationToken cancellationToken) =>
        Ok(await billService.GetAllAsync(cancellationToken));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<BillSummaryDto>> GetById(int id, CancellationToken cancellationToken) =>
        Ok(await billService.GetByIdAsync(id, cancellationToken));

    [HttpGet("table/{tableId:int}")]
    public async Task<ActionResult<BillSummaryDto?>> GetByTableId(int tableId, CancellationToken cancellationToken) =>
        Ok(await billService.GetByTableIdAsync(tableId, cancellationToken));

    [HttpPost]
    public async Task<ActionResult<BillSummaryDto>> Create([FromBody] CreateBillRequest request, CancellationToken cancellationToken)
    {
        var response = await billService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<BillSummaryDto>> Update(int id, [FromBody] UpdateBillRequest request, CancellationToken cancellationToken) =>
        Ok(await billService.UpdateAsync(id, request, cancellationToken));

    [HttpPut("{id:int}/close")]
    public async Task<ActionResult<BillSummaryDto>> Close(int id, CancellationToken cancellationToken) =>
        Ok(await billService.CloseAsync(id, cancellationToken));

    [HttpPut("{id:int}/cancel")]
    public async Task<ActionResult<BillSummaryDto>> Cancel(int id, CancellationToken cancellationToken) =>
        Ok(await billService.CancelAsync(id, cancellationToken));

    [HttpPut("{id:int}/apply-discount")]
    public async Task<ActionResult<BillSummaryDto>> ApplyDiscount(int id, [FromBody] ApplyDiscountRequest request, CancellationToken cancellationToken) =>
        Ok(await billService.ApplyDiscountAsync(id, request, cancellationToken));

    [HttpPut("{id:int}/service-charge")]
    public async Task<ActionResult<BillSummaryDto>> UpdateServiceCharge(int id, [FromBody] UpdateServiceChargeRequest request, CancellationToken cancellationToken) =>
        Ok(await billService.UpdateServiceChargeAsync(id, request, cancellationToken));

    [HttpGet("{billId:int}/items")]
    public async Task<ActionResult<List<BillItemDto>>> GetItems(int billId, CancellationToken cancellationToken) =>
        Ok(await billService.GetItemsAsync(billId, cancellationToken));

    [HttpPost("{billId:int}/items")]
    public async Task<ActionResult<BillItemDto>> AddItem(int billId, [FromBody] AddBillItemRequest request, CancellationToken cancellationToken) =>
        Ok(await billService.AddItemAsync(billId, request, cancellationToken));

    [HttpPost("{billId:int}/complimentary-approval")]
    public async Task<ActionResult<BillSummaryDto>> ApproveComplimentary(int billId, [FromBody] ComplimentaryApprovalRequest request, CancellationToken cancellationToken) =>
        Ok(await billService.ApproveComplimentaryAsync(billId, request, cancellationToken));
}
