using Backend.DTOs;
using Backend.Helpers;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Authorize]
[Route("api/terminals")]
public class TerminalsController(ITerminalService terminalService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<PosTerminalDto>>> GetAll(CancellationToken cancellationToken) =>
        Ok(await terminalService.GetAllAsync(cancellationToken));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<PosTerminalDto>> GetById(int id, CancellationToken cancellationToken) =>
        Ok(await terminalService.GetByIdAsync(id, cancellationToken));

    [HttpGet("branch/{branchId:int}")]
    public async Task<ActionResult<List<PosTerminalDto>>> GetByBranch(int branchId, CancellationToken cancellationToken) =>
        Ok(await terminalService.GetByBranchIdAsync(branchId, cancellationToken));

    [Authorize(Roles = $"{RoleNames.Cashier},{RoleNames.BranchManager},{RoleNames.SystemAdministrator}")]
    [HttpPost]
    public async Task<ActionResult<PosTerminalDto>> Create([FromBody] UpsertPosTerminalRequest request, CancellationToken cancellationToken) =>
        Ok(await terminalService.CreateAsync(request, cancellationToken));

    [Authorize(Roles = $"{RoleNames.Cashier},{RoleNames.BranchManager},{RoleNames.SystemAdministrator}")]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<PosTerminalDto>> Update(int id, [FromBody] UpsertPosTerminalRequest request, CancellationToken cancellationToken) =>
        Ok(await terminalService.UpdateAsync(id, request, cancellationToken));

    [Authorize(Roles = $"{RoleNames.Cashier},{RoleNames.BranchManager},{RoleNames.SystemAdministrator}")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        await terminalService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }

    [Authorize(Roles = $"{RoleNames.Cashier},{RoleNames.BranchManager},{RoleNames.SystemAdministrator}")]
    [HttpPut("{id:int}/set-default")]
    public async Task<ActionResult<PosTerminalDto>> SetDefault(int id, CancellationToken cancellationToken) =>
        Ok(await terminalService.SetDefaultAsync(id, cancellationToken));

    [Authorize(Roles = $"{RoleNames.Cashier},{RoleNames.BranchManager},{RoleNames.SystemAdministrator}")]
    [HttpPut("{id:int}/status")]
    public async Task<ActionResult<PosTerminalDto>> UpdateStatus(int id, [FromBody] UpdateTerminalStatusRequest request, CancellationToken cancellationToken) =>
        Ok(await terminalService.UpdateStatusAsync(id, request, cancellationToken));

    [Authorize(Roles = $"{RoleNames.Cashier},{RoleNames.BranchManager},{RoleNames.SystemAdministrator}")]
    [HttpPost("{id:int}/test-connection")]
    public async Task<ActionResult<TerminalTestConnectionDto>> TestConnection(int id, CancellationToken cancellationToken) =>
        Ok(await terminalService.TestConnectionAsync(id, cancellationToken));
}
