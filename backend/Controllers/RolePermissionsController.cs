using Backend.DTOs;
using Backend.Helpers;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Authorize(Roles = $"{RoleNames.BranchManager},{RoleNames.SystemAdministrator}")]
[Route("api/rolepermissions")]
public class RolePermissionsController(IPermissionService permissionService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<RolePermissionMatrixDto>>> GetAll(CancellationToken cancellationToken) =>
        Ok(await permissionService.GetRoleMatrixAsync(cancellationToken));

    [HttpGet("{roleId:int}")]
    public async Task<ActionResult<RolePermissionMatrixDto>> GetByRole(int roleId, CancellationToken cancellationToken) =>
        Ok(await permissionService.GetRoleMatrixByRoleIdAsync(roleId, cancellationToken));

    [HttpPut("{roleId:int}")]
    public async Task<ActionResult<RolePermissionMatrixDto>> Update(int roleId, [FromBody] UpdateRolePermissionsRequest request, CancellationToken cancellationToken) =>
        Ok(await permissionService.UpdateRolePermissionsAsync(roleId, request, cancellationToken));
}
