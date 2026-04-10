using Backend.DTOs;
using Backend.Helpers;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Authorize(Roles = $"{RoleNames.BranchManager},{RoleNames.SystemAdministrator}")]
[Route("api/auditlogs")]
public class AuditLogsController(IAuditLogService auditLogService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<AuditLogDto>>> GetAll(CancellationToken cancellationToken) =>
        Ok(await auditLogService.GetAllAsync(cancellationToken));

    [HttpGet("entity/{entityName}/{entityId}")]
    public async Task<ActionResult<List<AuditLogDto>>> GetByEntity(string entityName, string entityId, CancellationToken cancellationToken) =>
        Ok(await auditLogService.GetByEntityAsync(entityName, entityId, cancellationToken));
}
