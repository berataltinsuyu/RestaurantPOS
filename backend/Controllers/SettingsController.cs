using Backend.DTOs;
using Backend.Helpers;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Authorize(Roles = $"{RoleNames.BranchManager},{RoleNames.SystemAdministrator}")]
[Route("api/settings")]
public class SettingsController(ISettingsService settingsService) : ControllerBase
{
    [HttpGet("business/{branchId:int}")]
    public async Task<ActionResult<BranchSummaryDto>> GetBusiness(int branchId, CancellationToken cancellationToken) =>
        Ok(await settingsService.GetBusinessSettingsAsync(branchId, cancellationToken));

    [HttpPut("business/{branchId:int}")]
    public async Task<ActionResult<BranchSummaryDto>> UpdateBusiness(int branchId, [FromBody] UpsertBranchRequest request, CancellationToken cancellationToken) =>
        Ok(await settingsService.UpdateBusinessSettingsAsync(branchId, request, cancellationToken));

    [HttpGet("printers")]
    public async Task<ActionResult<List<PrinterSettingDto>>> GetPrinters([FromQuery] int? branchId, CancellationToken cancellationToken) =>
        Ok(await settingsService.GetPrintersAsync(branchId, cancellationToken));

    [HttpPost("printers")]
    public async Task<ActionResult<PrinterSettingDto>> CreatePrinter([FromBody] UpsertPrinterSettingRequest request, CancellationToken cancellationToken) =>
        Ok(await settingsService.CreatePrinterAsync(request, cancellationToken));

    [HttpPut("printers/{id:int}")]
    public async Task<ActionResult<PrinterSettingDto>> UpdatePrinter(int id, [FromBody] UpsertPrinterSettingRequest request, CancellationToken cancellationToken) =>
        Ok(await settingsService.UpdatePrinterAsync(id, request, cancellationToken));

    [HttpDelete("printers/{id:int}")]
    public async Task<IActionResult> DeletePrinter(int id, CancellationToken cancellationToken)
    {
        await settingsService.DeletePrinterAsync(id, cancellationToken);
        return NoContent();
    }

    [HttpGet("app-config")]
    public async Task<ActionResult<List<AppSettingDto>>> GetAppSettings([FromQuery] int? branchId, CancellationToken cancellationToken) =>
        Ok(await settingsService.GetAppSettingsAsync(branchId, cancellationToken));

    [HttpPost("app-config")]
    public async Task<ActionResult<AppSettingDto>> CreateAppSetting([FromBody] UpsertAppSettingRequest request, CancellationToken cancellationToken) =>
        Ok(await settingsService.CreateAppSettingAsync(request, cancellationToken));

    [HttpPut("app-config/{id:int}")]
    public async Task<ActionResult<AppSettingDto>> UpdateAppSetting(int id, [FromBody] UpsertAppSettingRequest request, CancellationToken cancellationToken) =>
        Ok(await settingsService.UpdateAppSettingAsync(id, request, cancellationToken));

    [HttpDelete("app-config/{id:int}")]
    public async Task<IActionResult> DeleteAppSetting(int id, CancellationToken cancellationToken)
    {
        await settingsService.DeleteAppSettingAsync(id, cancellationToken);
        return NoContent();
    }
}
