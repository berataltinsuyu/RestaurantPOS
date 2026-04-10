using Backend.Enums;

namespace Backend.DTOs;

public class ProductCategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public int ProductCount { get; set; }
}

public class UpsertProductCategoryRequest
{
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}

public class ProductDto
{
    public int Id { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public decimal VatRate { get; set; }
    public bool IsActive { get; set; }
    public bool IsMenuActive { get; set; }
    public bool IsOutOfStock { get; set; }
    public ProductMenuStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class UpsertProductRequest
{
    public int CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public decimal VatRate { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsMenuActive { get; set; } = true;
    public bool IsOutOfStock { get; set; }
}
