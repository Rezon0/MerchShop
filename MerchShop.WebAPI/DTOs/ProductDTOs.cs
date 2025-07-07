using System.Collections.Generic;

namespace MerchShop.WebAPI.DTOs
{
    // DTO для Design (используется внутри ProductDesignResponseDto)
    public class DesignResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
    }

    // DTO для ProductDesign (используется внутри ProductResponseDto)
    public class ProductDesignResponseDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public int DesignId { get; set; }
        public DesignResponseDto? Design { get; set; } // Включаем DTO для Design
        public int CoordinateX { get; set; }
        public int CoordinateY { get; set; }
        public bool IsAvailable { get; set; }
        public decimal PriceAtOrder { get; set; }
        public int Quantity { get; set; }
    }

    // DTO для Product (основной ответ для товаров)
    public class ProductResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string? Description { get; set; }
        public int BaseColorId { get; set; }
        public string BaseColorName { get; set; } = string.Empty; // Добавлено для отображения имени цвета
        public string? PrimaryImageUrl { get; set; }
        public ICollection<ProductDesignResponseDto> ProductDesigns { get; set; } = new List<ProductDesignResponseDto>();
    }
}
