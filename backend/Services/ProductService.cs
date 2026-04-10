using Backend.DTOs;
using Backend.Entities;
using Backend.Enums;
using Backend.Helpers;
using Backend.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public interface IProductService
{
    Task<List<ProductCategoryDto>> GetCategoriesAsync(CancellationToken cancellationToken = default);
    Task<ProductCategoryDto> CreateCategoryAsync(UpsertProductCategoryRequest request, CancellationToken cancellationToken = default);
    Task<ProductCategoryDto> UpdateCategoryAsync(int id, UpsertProductCategoryRequest request, CancellationToken cancellationToken = default);
    Task DeleteCategoryAsync(int id, CancellationToken cancellationToken = default);

    Task<List<ProductDto>> GetProductsAsync(int? categoryId = null, ProductMenuStatus? status = null, string? search = null, bool onlyMenuItems = false, CancellationToken cancellationToken = default);
    Task<List<ProductDto>> GetProductsByCategoryAsync(int categoryId, CancellationToken cancellationToken = default);
    Task<ProductDto> GetProductByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<ProductDto> CreateProductAsync(UpsertProductRequest request, CancellationToken cancellationToken = default);
    Task<ProductDto> UpdateProductAsync(int id, UpsertProductRequest request, CancellationToken cancellationToken = default);
    Task<ProductDto> DeactivateProductAsync(int id, CancellationToken cancellationToken = default);
    Task<ProductDto> MarkOutOfStockAsync(int id, CancellationToken cancellationToken = default);
    Task<ProductDto> ReactivateProductAsync(int id, CancellationToken cancellationToken = default);
    Task DeleteProductAsync(int id, CancellationToken cancellationToken = default);
}

public class ProductService(
    IRepository<ProductCategory> categoryRepository,
    IRepository<Product> productRepository,
    ICurrentUserService currentUserService,
    IAuditLogService auditLogService,
    IUnitOfWork unitOfWork) : IProductService
{
    public async Task<List<ProductCategoryDto>> GetCategoriesAsync(CancellationToken cancellationToken = default)
    {
        var categories = await categoryRepository.Query()
            .AsNoTracking()
            .Include(x => x.Products)
            .OrderBy(x => x.Name)
            .ToListAsync(cancellationToken);

        return categories.Select(MapCategory).ToList();
    }

    public async Task<ProductCategoryDto> CreateCategoryAsync(UpsertProductCategoryRequest request, CancellationToken cancellationToken = default)
    {
        var exists = await categoryRepository.Query().AnyAsync(x => x.Name == request.Name, cancellationToken);
        if (exists)
        {
            throw new ConflictException("Category already exists.");
        }

        var category = new ProductCategory
        {
            Name = request.Name,
            IsActive = request.IsActive
        };

        await categoryRepository.AddAsync(category, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        await auditLogService.CreateAsync(currentUserService.UserId, "Create", nameof(ProductCategory), category.Id.ToString(), $"Category {category.Name} created.", currentUserService.IpAddress, cancellationToken);
        return MapCategory(category);
    }

    public async Task<ProductCategoryDto> UpdateCategoryAsync(int id, UpsertProductCategoryRequest request, CancellationToken cancellationToken = default)
    {
        var category = await categoryRepository.Query()
            .Include(x => x.Products)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Category not found.");

        var exists = await categoryRepository.Query().AnyAsync(x => x.Name == request.Name && x.Id != id, cancellationToken);
        if (exists)
        {
            throw new ConflictException("Category already exists.");
        }

        category.Name = request.Name;
        category.IsActive = request.IsActive;
        categoryRepository.Update(category);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        await auditLogService.CreateAsync(currentUserService.UserId, "Update", nameof(ProductCategory), category.Id.ToString(), $"Category {category.Name} updated.", currentUserService.IpAddress, cancellationToken);
        return MapCategory(category);
    }

    public async Task DeleteCategoryAsync(int id, CancellationToken cancellationToken = default)
    {
        var category = await categoryRepository.Query()
            .Include(x => x.Products)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Category not found.");

        if (category.Products.Any())
        {
            category.IsActive = false;
            categoryRepository.Update(category);
        }
        else
        {
            categoryRepository.Remove(category);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);
        await auditLogService.CreateAsync(currentUserService.UserId, "Delete", nameof(ProductCategory), category.Id.ToString(), $"Category {category.Name} deleted/deactivated.", currentUserService.IpAddress, cancellationToken);
    }

    public async Task<List<ProductDto>> GetProductsAsync(int? categoryId = null, ProductMenuStatus? status = null, string? search = null, bool onlyMenuItems = false, CancellationToken cancellationToken = default)
    {
        var query = productRepository.Query()
            .AsNoTracking()
            .Include(x => x.Category)
            .AsQueryable();

        if (categoryId.HasValue)
        {
            query = query.Where(x => x.CategoryId == categoryId.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(x =>
                EF.Functions.Like(x.Name, $"%{term}%") ||
                (x.Description != null && EF.Functions.Like(x.Description, $"%{term}%")));
        }

        if (status.HasValue)
        {
            query = status.Value switch
            {
                ProductMenuStatus.Aktif => query.Where(x => x.IsActive && x.IsMenuActive && !x.IsOutOfStock && x.Category != null && x.Category.IsActive),
                ProductMenuStatus.Pasif => query.Where(x => !x.IsActive || !x.IsMenuActive || (x.Category != null && !x.Category.IsActive)),
                ProductMenuStatus.Tukendi => query.Where(x => x.IsOutOfStock),
                _ => query
            };
        }

        if (onlyMenuItems)
        {
            query = query.Where(x => x.IsActive && x.IsMenuActive && !x.IsOutOfStock && x.Category != null && x.Category.IsActive);
        }

        var products = await query
            .OrderBy(x => x.Name)
            .ToListAsync(cancellationToken);

        return products.Select(MapProduct).ToList();
    }

    public async Task<List<ProductDto>> GetProductsByCategoryAsync(int categoryId, CancellationToken cancellationToken = default)
    {
        return await GetProductsAsync(categoryId: categoryId, cancellationToken: cancellationToken);
    }

    public async Task<ProductDto> GetProductByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var product = await productRepository.Query()
            .AsNoTracking()
            .Include(x => x.Category)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Product not found.");

        return MapProduct(product);
    }

    public async Task<ProductDto> CreateProductAsync(UpsertProductRequest request, CancellationToken cancellationToken = default)
    {
        await EnsureCategoryExistsAsync(request.CategoryId, cancellationToken);

        var product = new Product
        {
            CategoryId = request.CategoryId,
            Name = request.Name,
            Description = request.Description,
            Price = request.Price,
            VatRate = request.VatRate,
            IsActive = request.IsActive,
            IsMenuActive = request.IsMenuActive,
            IsOutOfStock = request.IsOutOfStock,
            UpdatedAt = DateTime.UtcNow
        };

        await productRepository.AddAsync(product, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        await auditLogService.CreateAsync(currentUserService.UserId, "Create", nameof(Product), product.Id.ToString(), $"Product {product.Name} created.", currentUserService.IpAddress, cancellationToken);
        return await GetProductByIdAsync(product.Id, cancellationToken);
    }

    public async Task<ProductDto> UpdateProductAsync(int id, UpsertProductRequest request, CancellationToken cancellationToken = default)
    {
        var product = await productRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Product not found.");

        await EnsureCategoryExistsAsync(request.CategoryId, cancellationToken);

        product.CategoryId = request.CategoryId;
        product.Name = request.Name;
        product.Description = request.Description;
        product.Price = request.Price;
        product.VatRate = request.VatRate;
        product.IsActive = request.IsActive;
        product.IsMenuActive = request.IsMenuActive;
        product.IsOutOfStock = request.IsOutOfStock && request.IsActive && request.IsMenuActive;
        product.UpdatedAt = DateTime.UtcNow;
        productRepository.Update(product);

        await unitOfWork.SaveChangesAsync(cancellationToken);
        await auditLogService.CreateAsync(currentUserService.UserId, "Update", nameof(Product), product.Id.ToString(), $"Product {product.Name} updated.", currentUserService.IpAddress, cancellationToken);
        return await GetProductByIdAsync(product.Id, cancellationToken);
    }

    public async Task<ProductDto> DeactivateProductAsync(int id, CancellationToken cancellationToken = default)
    {
        var product = await productRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Product not found.");

        product.IsActive = false;
        product.IsMenuActive = false;
        product.IsOutOfStock = false;
        product.UpdatedAt = DateTime.UtcNow;
        productRepository.Update(product);

        await unitOfWork.SaveChangesAsync(cancellationToken);
        await auditLogService.CreateAsync(currentUserService.UserId, "Deactivate", nameof(Product), product.Id.ToString(), $"Product {product.Name} deactivated.", currentUserService.IpAddress, cancellationToken);
        return await GetProductByIdAsync(product.Id, cancellationToken);
    }

    public async Task<ProductDto> MarkOutOfStockAsync(int id, CancellationToken cancellationToken = default)
    {
        var product = await productRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Product not found.");

        product.IsActive = true;
        product.IsMenuActive = true;
        product.IsOutOfStock = true;
        product.UpdatedAt = DateTime.UtcNow;
        productRepository.Update(product);

        await unitOfWork.SaveChangesAsync(cancellationToken);
        await auditLogService.CreateAsync(currentUserService.UserId, "OutOfStock", nameof(Product), product.Id.ToString(), $"Product {product.Name} marked as out of stock.", currentUserService.IpAddress, cancellationToken);
        return await GetProductByIdAsync(product.Id, cancellationToken);
    }

    public async Task<ProductDto> ReactivateProductAsync(int id, CancellationToken cancellationToken = default)
    {
        var product = await productRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Product not found.");

        product.IsActive = true;
        product.IsMenuActive = true;
        product.IsOutOfStock = false;
        product.UpdatedAt = DateTime.UtcNow;
        productRepository.Update(product);

        await unitOfWork.SaveChangesAsync(cancellationToken);
        await auditLogService.CreateAsync(currentUserService.UserId, "Reactivate", nameof(Product), product.Id.ToString(), $"Product {product.Name} reactivated.", currentUserService.IpAddress, cancellationToken);
        return await GetProductByIdAsync(product.Id, cancellationToken);
    }

    public async Task DeleteProductAsync(int id, CancellationToken cancellationToken = default)
    {
        var product = await productRepository.Query()
            .Include(x => x.BillItems)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Product not found.");

        if (product.BillItems.Count == 0)
        {
            productRepository.Remove(product);
        }
        else
        {
            product.IsActive = false;
            product.IsMenuActive = false;
            product.IsOutOfStock = false;
            product.UpdatedAt = DateTime.UtcNow;
            productRepository.Update(product);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);
        await auditLogService.CreateAsync(currentUserService.UserId, "Delete", nameof(Product), product.Id.ToString(), $"Product {product.Name} removed from menu.", currentUserService.IpAddress, cancellationToken);
    }

    private async Task EnsureCategoryExistsAsync(int categoryId, CancellationToken cancellationToken)
    {
        var exists = await categoryRepository.AnyAsync(x => x.Id == categoryId, cancellationToken);
        if (!exists)
        {
            throw new BadRequestException("Category not found.");
        }
    }

    private static ProductCategoryDto MapCategory(ProductCategory category) => new()
    {
        Id = category.Id,
        Name = category.Name,
        IsActive = category.IsActive,
        ProductCount = category.Products.Count
    };

    private static ProductDto MapProduct(Product product) => new()
    {
        Id = product.Id,
        CategoryId = product.CategoryId,
        CategoryName = product.Category?.Name ?? string.Empty,
        Name = product.Name,
        Description = product.Description,
        Price = product.Price,
        VatRate = product.VatRate,
        IsActive = product.IsActive,
        IsMenuActive = product.IsMenuActive,
        IsOutOfStock = product.IsOutOfStock,
        Status = ResolveStatus(product),
        CreatedAt = product.CreatedAt,
        UpdatedAt = product.UpdatedAt
    };

    private static ProductMenuStatus ResolveStatus(Product product)
    {
        if (product.IsOutOfStock)
        {
            return ProductMenuStatus.Tukendi;
        }

        if (!product.IsActive || !product.IsMenuActive || (product.Category is not null && !product.Category.IsActive))
        {
            return ProductMenuStatus.Pasif;
        }

        return ProductMenuStatus.Aktif;
    }
}
