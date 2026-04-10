using Backend.DTOs;
using Backend.Helpers;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Authorize(Roles = $"{RoleNames.BranchManager},{RoleNames.SystemAdministrator}")]
[Route("api/branches")]
public class BranchesController(IBranchService branchService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<BranchSummaryDto>>> GetAll(CancellationToken cancellationToken) =>
        Ok(await branchService.GetAllAsync(cancellationToken));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<BranchSummaryDto>> GetById(int id, CancellationToken cancellationToken) =>
        Ok(await branchService.GetByIdAsync(id, cancellationToken));

    [HttpPost]
    public async Task<ActionResult<BranchSummaryDto>> Create([FromBody] UpsertBranchRequest request, CancellationToken cancellationToken)
    {
        var response = await branchService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<BranchSummaryDto>> Update(int id, [FromBody] UpsertBranchRequest request, CancellationToken cancellationToken) =>
        Ok(await branchService.UpdateAsync(id, request, cancellationToken));

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        await branchService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}
