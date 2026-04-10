using Backend.DTOs;
using Backend.Helpers;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Authorize]
[Route("api/tables")]
public class TablesController(ITableService tableService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<TableSummaryDto>>> GetAll(CancellationToken cancellationToken) =>
        Ok(await tableService.GetAllAsync(cancellationToken));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TableSummaryDto>> GetById(int id, CancellationToken cancellationToken) =>
        Ok(await tableService.GetByIdAsync(id, cancellationToken));

    [HttpGet("branch/{branchId:int}")]
    public async Task<ActionResult<List<TableSummaryDto>>> GetByBranch(int branchId, CancellationToken cancellationToken) =>
        Ok(await tableService.GetByBranchIdAsync(branchId, cancellationToken));

    [Authorize(Roles = $"{RoleNames.BranchManager},{RoleNames.SystemAdministrator}")]
    [HttpPost]
    public async Task<ActionResult<TableSummaryDto>> Create([FromBody] CreateTableRequest request, CancellationToken cancellationToken)
    {
        var response = await tableService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
    }

    [Authorize(Roles = $"{RoleNames.BranchManager},{RoleNames.SystemAdministrator}")]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<TableSummaryDto>> Update(int id, [FromBody] UpdateTableRequest request, CancellationToken cancellationToken) =>
        Ok(await tableService.UpdateAsync(id, request, cancellationToken));

    [Authorize(Roles = $"{RoleNames.BranchManager},{RoleNames.SystemAdministrator}")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        await tableService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }

    [HttpPut("{id:int}/status")]
    public async Task<ActionResult<TableSummaryDto>> UpdateStatus(int id, [FromBody] UpdateTableStatusRequest request, CancellationToken cancellationToken) =>
        Ok(await tableService.UpdateStatusAsync(id, request, cancellationToken));

    [HttpPut("{id:int}/assign-waiter")]
    public async Task<ActionResult<TableSummaryDto>> AssignWaiter(int id, [FromBody] AssignWaiterRequest request, CancellationToken cancellationToken) =>
        Ok(await tableService.AssignWaiterAsync(id, request, cancellationToken));

    [HttpPost("{id:int}/open")]
    public async Task<ActionResult<TableSummaryDto>> OpenTable(int id, [FromBody] OpenTableRequest request, CancellationToken cancellationToken) =>
        Ok(await tableService.OpenTableAsync(id, request, cancellationToken));

    [HttpPost("{id:int}/move")]
    public async Task<ActionResult<TableSummaryDto>> Move(int id, [FromBody] MoveTableRequest request, CancellationToken cancellationToken) =>
        Ok(await tableService.MoveTableAsync(id, request, cancellationToken));

    [HttpPost("{id:int}/merge")]
    public async Task<ActionResult<TableSummaryDto>> Merge(int id, [FromBody] MergeTablesRequest request, CancellationToken cancellationToken) =>
        Ok(await tableService.MergeTablesAsync(id, request, cancellationToken));

    [HttpPost("{id:int}/split")]
    public async Task<ActionResult<TableSummaryDto>> Split(int id, [FromBody] SplitTableRequest request, CancellationToken cancellationToken) =>
        Ok(await tableService.SplitTableAsync(id, request, cancellationToken));

    [HttpPost("{id:int}/reservation")]
    public async Task<ActionResult<TableSummaryDto>> AddReservation(int id, [FromBody] ReservationRequest request, CancellationToken cancellationToken) =>
        Ok(await tableService.AddReservationAsync(id, request, cancellationToken));
}
