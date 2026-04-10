using Backend.DTOs;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Authorize]
[Route("api/billitems")]
public class BillItemsController(IBillService billService) : ControllerBase
{
    [HttpPut("{id:int}")]
    public async Task<ActionResult<BillItemDto>> Update(int id, [FromBody] UpdateBillItemRequest request, CancellationToken cancellationToken) =>
        Ok(await billService.UpdateItemAsync(id, request, cancellationToken));

    [HttpPut("{id:int}/status")]
    public async Task<ActionResult<BillItemDto>> UpdateStatus(int id, [FromBody] UpdateBillItemStatusRequest request, CancellationToken cancellationToken) =>
        Ok(await billService.UpdateItemStatusAsync(id, request, cancellationToken));

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        await billService.DeleteItemAsync(id, cancellationToken);
        return NoContent();
    }
}
