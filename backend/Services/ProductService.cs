using Backend.DTOs;
using Backend.Entities;
using Backend.Enums;
using Backend.Helpers;
using Backend.Repositories;
using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Text;

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
    byte[] CreateImportTemplate();
    Task<ProductImportSummaryDto> ImportProductsFromExcelAsync(Stream fileStream, CancellationToken cancellationToken = default);
}

public class ProductService(
    IRepository<ProductCategory> categoryRepository,
    IRepository<Product> productRepository,
    ICurrentUserService currentUserService,
    IAuditLogService auditLogService,
    IUnitOfWork unitOfWork) : IProductService
{
    private static readonly CultureInfo TurkishCulture = CultureInfo.GetCultureInfo("tr-TR");
    private static readonly string[] ImportHeaders =
    [
        "Kategori",
        "Ürün Adı",
        "Açıklama",
        "Fiyat",
        "Aktif mi",
        "Menüde Göster",
        "Stokta Yok"
    ];

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
        var categoryName = CleanDisplayText(request.Name);
        if (string.IsNullOrWhiteSpace(categoryName))
        {
            throw new BadRequestException("Category name is required.");
        }

        var existingCategories = await categoryRepository.Query()
            .AsNoTracking()
            .Select(x => x.Name)
            .ToListAsync(cancellationToken);
        if (existingCategories.Any(x => NormalizeLookupKey(x) == NormalizeLookupKey(categoryName)))
        {
            throw new ConflictException("Category already exists.");
        }

        var category = new ProductCategory
        {
            Name = categoryName,
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

        var categoryName = CleanDisplayText(request.Name);
        if (string.IsNullOrWhiteSpace(categoryName))
        {
            throw new BadRequestException("Category name is required.");
        }

        var existingCategories = await categoryRepository.Query()
            .AsNoTracking()
            .Where(x => x.Id != id)
            .Select(x => x.Name)
            .ToListAsync(cancellationToken);
        if (existingCategories.Any(x => NormalizeLookupKey(x) == NormalizeLookupKey(categoryName)))
        {
            throw new ConflictException("Category already exists.");
        }

        category.Name = categoryName;
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

    public byte[] CreateImportTemplate()
    {
        using var workbook = new XLWorkbook();
        var worksheet = workbook.AddWorksheet("Menü Aktarım");

        for (var columnIndex = 0; columnIndex < ImportHeaders.Length; columnIndex++)
        {
            worksheet.Cell(1, columnIndex + 1).Value = ImportHeaders[columnIndex];
        }

        var headerRange = worksheet.Range(1, 1, 1, ImportHeaders.Length);
        headerRange.Style.Font.Bold = true;
        headerRange.Style.Fill.BackgroundColor = XLColor.FromHtml("#D4A017");
        headerRange.Style.Font.FontColor = XLColor.White;
        headerRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

        worksheet.SheetView.FreezeRows(1);
        worksheet.Columns(1, ImportHeaders.Length).Width = 22;
        worksheet.Column(3).Width = 36;
        worksheet.Column(4).Style.NumberFormat.Format = "#,##0.00";

        var notes = workbook.AddWorksheet("Notlar");
        notes.Cell(1, 1).Value = "Zorunlu alanlar";
        notes.Cell(1, 2).Value = "Kategori, Ürün Adı, Fiyat";
        notes.Cell(2, 1).Value = "Boolean alanlar";
        notes.Cell(2, 2).Value = "Evet/Hayır, true/false veya 1/0 kabul edilir.";
        notes.Cell(3, 1).Value = "Stokta Yok";
        notes.Cell(3, 2).Value = "Yalnızca aktif ve menüde gösterilen ürünler için Evet olabilir.";
        notes.Range(1, 1, 3, 1).Style.Font.Bold = true;
        notes.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }

    public async Task<ProductImportSummaryDto> ImportProductsFromExcelAsync(Stream fileStream, CancellationToken cancellationToken = default)
    {
        var summary = new ProductImportSummaryDto();
        List<ProductImportRow> validRows;

        try
        {
            using var workbook = new XLWorkbook(fileStream);
            var worksheet = workbook.Worksheets.FirstOrDefault()
                ?? throw new BadRequestException("Excel dosyasında okunabilir sayfa bulunamadı.");

            validRows = ParseImportRows(worksheet, summary);
        }
        catch (BadRequestException)
        {
            throw;
        }
        catch
        {
            throw new BadRequestException("Excel dosyası okunamadı. Lütfen .xlsx şablonunu kullanın.");
        }

        if (validRows.Count == 0)
        {
            return summary;
        }

        var categories = await categoryRepository.Query()
            .Include(x => x.Products)
            .OrderBy(x => x.Id)
            .ToListAsync(cancellationToken);
        var categoriesByName = new Dictionary<string, ProductCategory>();

        foreach (var category in categories)
        {
            categoriesByName.TryAdd(NormalizeLookupKey(category.Name), category);
        }

        foreach (var categoryName in validRows.Select(x => x.CategoryName).DistinctBy(NormalizeLookupKey))
        {
            var categoryKey = NormalizeLookupKey(categoryName);
            if (categoriesByName.ContainsKey(categoryKey))
            {
                continue;
            }

            var category = new ProductCategory
            {
                Name = categoryName,
                IsActive = true
            };

            await categoryRepository.AddAsync(category, cancellationToken);
            categoriesByName[categoryKey] = category;
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        var products = await productRepository.Query()
            .Include(x => x.Category)
            .OrderBy(x => x.Id)
            .ToListAsync(cancellationToken);
        var productsByCategoryAndName = new Dictionary<string, Product>();

        foreach (var product in products)
        {
            var categoryKey = product.Category is not null
                ? NormalizeLookupKey(product.Category.Name)
                : categories.FirstOrDefault(x => x.Id == product.CategoryId) is { } fallbackCategory
                    ? NormalizeLookupKey(fallbackCategory.Name)
                    : string.Empty;

            if (string.IsNullOrWhiteSpace(categoryKey))
            {
                continue;
            }

            var productKey = CreateProductLookupKey(categoryKey, product.Name);
            if (!productsByCategoryAndName.TryGetValue(productKey, out var existingProduct))
            {
                productsByCategoryAndName[productKey] = product;
                continue;
            }

            if (categoriesByName.TryGetValue(categoryKey, out var canonicalCategory) &&
                existingProduct.CategoryId != canonicalCategory.Id &&
                product.CategoryId == canonicalCategory.Id)
            {
                productsByCategoryAndName[productKey] = product;
            }
        }

        foreach (var row in validRows)
        {
            var categoryKey = NormalizeLookupKey(row.CategoryName);
            var category = categoriesByName[categoryKey];
            var productKey = CreateProductLookupKey(categoryKey, row.ProductName);

            if (productsByCategoryAndName.TryGetValue(productKey, out var product))
            {
                product.CategoryId = category.Id;
                product.Name = row.ProductName;
                product.Description = row.Description;
                product.Price = row.Price;
                product.VatRate = 10;
                product.IsActive = row.IsActive;
                product.IsMenuActive = row.IsMenuActive;
                product.IsOutOfStock = row.IsOutOfStock;
                product.UpdatedAt = DateTime.UtcNow;
                productRepository.Update(product);
                summary.UpdatedCount++;
            }
            else
            {
                product = new Product
                {
                    CategoryId = category.Id,
                    Name = row.ProductName,
                    Description = row.Description,
                    Price = row.Price,
                    VatRate = 10,
                    IsActive = row.IsActive,
                    IsMenuActive = row.IsMenuActive,
                    IsOutOfStock = row.IsOutOfStock,
                    UpdatedAt = DateTime.UtcNow
                };

                await productRepository.AddAsync(product, cancellationToken);
                productsByCategoryAndName[productKey] = product;
                summary.CreatedCount++;
            }
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);
        await auditLogService.CreateAsync(
            currentUserService.UserId,
            "ImportExcel",
            nameof(Product),
            "bulk",
            $"Menu import completed. Created: {summary.CreatedCount}, Updated: {summary.UpdatedCount}, Skipped: {summary.SkippedCount}.",
            currentUserService.IpAddress,
            cancellationToken);

        return summary;
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

    private static List<ProductImportRow> ParseImportRows(IXLWorksheet worksheet, ProductImportSummaryDto summary)
    {
        var headerColumns = ResolveHeaderColumns(worksheet, summary);
        var lastRowNumber = worksheet.LastRowUsed()?.RowNumber() ?? 1;

        if (headerColumns.Count != ImportHeaders.Length)
        {
            summary.SkippedCount = Math.Max(0, lastRowNumber - 1);
            return [];
        }

        var rows = new List<ProductImportRow>();

        for (var rowNumber = 2; rowNumber <= lastRowNumber; rowNumber++)
        {
            var row = worksheet.Row(rowNumber);
            if (row.Cells(1, ImportHeaders.Length).All(cell => string.IsNullOrWhiteSpace(GetCellText(cell))))
            {
                continue;
            }

            var rowErrorsBefore = summary.ValidationErrors.Count;
            var categoryName = ReadRequiredText(row, headerColumns["Kategori"], "Kategori", rowNumber, summary, 64);
            var productName = ReadRequiredText(row, headerColumns["Ürün Adı"], "Ürün Adı", rowNumber, summary, 128);
            var description = ReadOptionalText(row, headerColumns["Açıklama"], "Açıklama", rowNumber, summary, 512);
            var price = ReadRequiredPrice(row.Cell(headerColumns["Fiyat"]), rowNumber, summary);
            var isActive = ReadBoolean(row.Cell(headerColumns["Aktif mi"]), "Aktif mi", rowNumber, summary, defaultValue: true);
            var isMenuActive = ReadBoolean(row.Cell(headerColumns["Menüde Göster"]), "Menüde Göster", rowNumber, summary, defaultValue: true);
            var isOutOfStock = ReadBoolean(row.Cell(headerColumns["Stokta Yok"]), "Stokta Yok", rowNumber, summary, defaultValue: false);

            if (isOutOfStock == true && (isActive != true || isMenuActive != true))
            {
                AddValidationError(summary, rowNumber, "Stokta Yok", "Stokta Yok yalnızca aktif ve menüde gösterilen ürünler için Evet olabilir.");
            }

            if (summary.ValidationErrors.Count > rowErrorsBefore)
            {
                summary.SkippedCount++;
                continue;
            }

            rows.Add(new ProductImportRow(
                rowNumber,
                categoryName!,
                productName!,
                description,
                price!.Value,
                isActive!.Value,
                isMenuActive!.Value,
                isOutOfStock!.Value));
        }

        return rows;
    }

    private static Dictionary<string, int> ResolveHeaderColumns(IXLWorksheet worksheet, ProductImportSummaryDto summary)
    {
        var headersByKey = new Dictionary<string, int>();

        foreach (var cell in worksheet.Row(1).CellsUsed())
        {
            var headerText = GetCellText(cell);
            if (!string.IsNullOrWhiteSpace(headerText))
            {
                headersByKey.TryAdd(NormalizeLookupKey(headerText), cell.Address.ColumnNumber);
            }
        }

        var columns = new Dictionary<string, int>();
        foreach (var header in ImportHeaders)
        {
            if (headersByKey.TryGetValue(NormalizeLookupKey(header), out var columnNumber))
            {
                columns[header] = columnNumber;
            }
            else
            {
                AddValidationError(summary, 1, header, $"{header} kolonu bulunamadı.");
            }
        }

        return columns;
    }

    private static string? ReadRequiredText(IXLRow row, int columnNumber, string field, int rowNumber, ProductImportSummaryDto summary, int maxLength)
    {
        var value = GetCellText(row.Cell(columnNumber));
        if (string.IsNullOrWhiteSpace(value))
        {
            AddValidationError(summary, rowNumber, field, $"{field} zorunludur.");
            return null;
        }

        if (value.Length > maxLength)
        {
            AddValidationError(summary, rowNumber, field, $"{field} en fazla {maxLength} karakter olabilir.");
            return null;
        }

        return value;
    }

    private static string? ReadOptionalText(IXLRow row, int columnNumber, string field, int rowNumber, ProductImportSummaryDto summary, int maxLength)
    {
        var value = GetCellText(row.Cell(columnNumber));
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        if (value.Length > maxLength)
        {
            AddValidationError(summary, rowNumber, field, $"{field} en fazla {maxLength} karakter olabilir.");
            return null;
        }

        return value;
    }

    private static decimal? ReadRequiredPrice(IXLCell cell, int rowNumber, ProductImportSummaryDto summary)
    {
        var text = GetCellText(cell);
        if (string.IsNullOrWhiteSpace(text))
        {
            AddValidationError(summary, rowNumber, "Fiyat", "Fiyat zorunludur.");
            return null;
        }

        if (!TryReadDecimal(cell, out var price))
        {
            AddValidationError(summary, rowNumber, "Fiyat", "Fiyat sayısal olmalıdır.");
            return null;
        }

        if (price <= 0)
        {
            AddValidationError(summary, rowNumber, "Fiyat", "Fiyat sıfırdan büyük olmalıdır.");
            return null;
        }

        return Math.Round(price, 2, MidpointRounding.AwayFromZero);
    }

    private static bool? ReadBoolean(IXLCell cell, string field, int rowNumber, ProductImportSummaryDto summary, bool defaultValue)
    {
        var text = GetCellText(cell);
        if (string.IsNullOrWhiteSpace(text))
        {
            return defaultValue;
        }

        var normalized = NormalizeLookupKey(text).Replace(" ", string.Empty);
        if (normalized is "EVET" or "TRUE" or "1")
        {
            return true;
        }

        if (normalized is "HAYIR" or "FALSE" or "0")
        {
            return false;
        }

        AddValidationError(summary, rowNumber, field, $"{field} değeri Evet/Hayır, true/false veya 1/0 olmalıdır.");
        return null;
    }

    private static bool TryReadDecimal(IXLCell cell, out decimal value)
    {
        if (cell.TryGetValue(out value))
        {
            return true;
        }

        var text = GetCellText(cell);
        return decimal.TryParse(text, NumberStyles.Number | NumberStyles.AllowCurrencySymbol, TurkishCulture, out value) ||
               decimal.TryParse(text, NumberStyles.Number | NumberStyles.AllowCurrencySymbol, CultureInfo.InvariantCulture, out value);
    }

    private static string GetCellText(IXLCell cell) => CleanDisplayText(cell.GetString());

    private static string NormalizeLookupKey(string value) =>
        RemoveDiacritics(CleanDisplayText(value))
            .Replace('ı', 'i')
            .ToUpperInvariant();

    private static string CreateProductLookupKey(string categoryKey, string productName) =>
        $"{categoryKey}:{NormalizeLookupKey(productName)}";

    private static string CleanDisplayText(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return string.Empty;
        }

        var builder = new StringBuilder(value.Length);
        var previousWasWhitespace = false;

        foreach (var character in value)
        {
            if (IsIgnoredFormattingCharacter(character))
            {
                continue;
            }

            if (char.IsWhiteSpace(character))
            {
                if (!previousWasWhitespace)
                {
                    builder.Append(' ');
                    previousWasWhitespace = true;
                }

                continue;
            }

            builder.Append(character);
            previousWasWhitespace = false;
        }

        return builder.ToString().Trim();
    }

    private static string RemoveDiacritics(string value)
    {
        if (string.IsNullOrEmpty(value))
        {
            return string.Empty;
        }

        var normalized = value.Normalize(NormalizationForm.FormD);
        var builder = new StringBuilder(normalized.Length);

        foreach (var character in normalized)
        {
            var unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(character);
            if (unicodeCategory is UnicodeCategory.NonSpacingMark or UnicodeCategory.SpacingCombiningMark or UnicodeCategory.EnclosingMark)
            {
                continue;
            }

            builder.Append(character);
        }

        return builder.ToString().Normalize(NormalizationForm.FormC);
    }

    private static bool IsIgnoredFormattingCharacter(char character) =>
        character is '\u200B' or '\u200C' or '\u200D' or '\u2060' or '\uFEFF';

    private static void AddValidationError(ProductImportSummaryDto summary, int rowNumber, string field, string message) =>
        summary.ValidationErrors.Add(new ProductImportValidationErrorDto
        {
            RowNumber = rowNumber,
            Field = field,
            Message = message
        });

    private sealed record ProductImportRow(
        int RowNumber,
        string CategoryName,
        string ProductName,
        string? Description,
        decimal Price,
        bool IsActive,
        bool IsMenuActive,
        bool IsOutOfStock);
}
