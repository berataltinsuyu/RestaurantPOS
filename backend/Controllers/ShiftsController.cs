using Backend.DTOs;
using Backend.Helpers;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Authorize]
[Route("api/shifts")]
public class ShiftsController(IShiftService shiftService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<ShiftDto>>> GetAll(CancellationToken cancellationToken) =>
        Ok(await shiftService.GetAllAsync(cancellationToken));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ShiftDto>> GetById(int id, CancellationToken cancellationToken) =>
        Ok(await shiftService.GetByIdAsync(id, cancellationToken));

    [HttpPost("open")]
    public async Task<ActionResult<ShiftDto>> Open([FromBody] OpenShiftRequest request, CancellationToken cancellationToken) =>
        Ok(await shiftService.OpenAsync(request, cancellationToken));

    [HttpPost("{id:int}/close")]
    public async Task<ActionResult<ShiftDto>> Close(int id, [FromBody] CloseShiftRequest request, CancellationToken cancellationToken) =>
        Ok(await shiftService.CloseAsync(id, request, cancellationToken));
}
