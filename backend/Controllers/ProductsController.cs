using Backend.DTOs;
using Backend.Enums;
using Backend.Helpers;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Authorize]
[Route("api/products")]
public class ProductsController(
    IProductService productService,
    IPermissionAuthorizationService permissionAuthorizationService) : ControllerBase
{
    private const string MenuManagementForbiddenMessage = "Bu işlem için Menü Yönetimi yetkiniz bulunmuyor.";

    [HttpGet]
    public async Task<ActionResult<List<ProductDto>>> GetAll(
        [FromQuery] int? categoryId,
        [FromQuery] ProductMenuStatus? status,
        [FromQuery] string? search,
        [FromQuery] bool onlyMenuItems,
        CancellationToken cancellationToken) =>
        Ok(await productService.GetProductsAsync(categoryId, status, search, onlyMenuItems, cancellationToken));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductDto>> GetById(int id, CancellationToken cancellationToken) =>
        Ok(await productService.GetProductByIdAsync(id, cancellationToken));

    [HttpGet("category/{categoryId:int}")]
    public async Task<ActionResult<List<ProductDto>>> GetByCategory(int categoryId, CancellationToken cancellationToken) =>
        Ok(await productService.GetProductsByCategoryAsync(categoryId, cancellationToken));

    [HttpPost]
    public async Task<ActionResult<ProductDto>> Create([FromBody] UpsertProductRequest request, CancellationToken cancellationToken)
    {
        await permissionAuthorizationService.EnsurePermissionAsync(PermissionCode.MenuManagement, MenuManagementForbiddenMessage, cancellationToken);
        return Ok(await productService.CreateProductAsync(request, cancellationToken));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ProductDto>> Update(int id, [FromBody] UpsertProductRequest request, CancellationToken cancellationToken)
    {
        await permissionAuthorizationService.EnsurePermissionAsync(PermissionCode.MenuManagement, MenuManagementForbiddenMessage, cancellationToken);
        return Ok(await productService.UpdateProductAsync(id, request, cancellationToken));
    }

    [HttpPut("{id:int}/deactivate")]
    public async Task<ActionResult<ProductDto>> Deactivate(int id, CancellationToken cancellationToken)
    {
        await permissionAuthorizationService.EnsurePermissionAsync(PermissionCode.MenuManagement, MenuManagementForbiddenMessage, cancellationToken);
        return Ok(await productService.DeactivateProductAsync(id, cancellationToken));
    }

    [HttpPut("{id:int}/mark-out-of-stock")]
    public async Task<ActionResult<ProductDto>> MarkOutOfStock(int id, CancellationToken cancellationToken)
    {
        await permissionAuthorizationService.EnsurePermissionAsync(PermissionCode.MenuManagement, MenuManagementForbiddenMessage, cancellationToken);
        return Ok(await productService.MarkOutOfStockAsync(id, cancellationToken));
    }

    [HttpPut("{id:int}/reactivate")]
    public async Task<ActionResult<ProductDto>> Reactivate(int id, CancellationToken cancellationToken)
    {
        await permissionAuthorizationService.EnsurePermissionAsync(PermissionCode.MenuManagement, MenuManagementForbiddenMessage, cancellationToken);
        return Ok(await productService.ReactivateProductAsync(id, cancellationToken));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        await permissionAuthorizationService.EnsurePermissionAsync(PermissionCode.MenuManagement, MenuManagementForbiddenMessage, cancellationToken);
        await productService.DeleteProductAsync(id, cancellationToken);
        return NoContent();
    }
}
