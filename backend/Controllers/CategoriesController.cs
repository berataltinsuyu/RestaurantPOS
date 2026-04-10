using Backend.DTOs;
using Backend.Helpers;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Authorize]
[Route("api/categories")]
public class CategoriesController(IProductService productService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<ProductCategoryDto>>> GetAll(CancellationToken cancellationToken) =>
        Ok(await productService.GetCategoriesAsync(cancellationToken));

    [Authorize(Roles = $"{RoleNames.BranchManager},{RoleNames.SystemAdministrator}")]
    [HttpPost]
    public async Task<ActionResult<ProductCategoryDto>> Create([FromBody] UpsertProductCategoryRequest request, CancellationToken cancellationToken) =>
        Ok(await productService.CreateCategoryAsync(request, cancellationToken));

    [Authorize(Roles = $"{RoleNames.BranchManager},{RoleNames.SystemAdministrator}")]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<ProductCategoryDto>> Update(int id, [FromBody] UpsertProductCategoryRequest request, CancellationToken cancellationToken) =>
        Ok(await productService.UpdateCategoryAsync(id, request, cancellationToken));

    [Authorize(Roles = $"{RoleNames.BranchManager},{RoleNames.SystemAdministrator}")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        await productService.DeleteCategoryAsync(id, cancellationToken);
        return NoContent();
    }
}
