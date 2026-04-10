using Backend.DTOs;
using Backend.Helpers;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Authorize(Roles = $"{RoleNames.BranchManager},{RoleNames.SystemAdministrator}")]
[Route("api/users")]
public class UsersController(IUserService userService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<UserSummaryDto>>> GetAll(CancellationToken cancellationToken) =>
        Ok(await userService.GetAllAsync(cancellationToken));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<UserSummaryDto>> GetById(int id, CancellationToken cancellationToken) =>
        Ok(await userService.GetByIdAsync(id, cancellationToken));

    [HttpPost]
    public async Task<ActionResult<UserSummaryDto>> Create([FromBody] CreateUserRequest request, CancellationToken cancellationToken)
    {
        var response = await userService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<UserSummaryDto>> Update(int id, [FromBody] UpdateUserRequest request, CancellationToken cancellationToken) =>
        Ok(await userService.UpdateAsync(id, request, cancellationToken));

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        await userService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}
