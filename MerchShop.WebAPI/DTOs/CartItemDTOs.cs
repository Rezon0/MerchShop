// MerchShop.WebAPI/DTOs/CartDTOs.cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MerchShop.WebAPI.DTOs
{
    // DTO для запроса на добавление товара в корзину
    public class AddCartItemRequest
    {
        [Required(ErrorMessage = "ProductDesignId обязателен.")]
        public int ProductDesignId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Количество должно быть не менее 1.")]
        public int Quantity { get; set; } = 1;
    }

    // DTO для запроса на обновление количества товара в корзине
    public class UpdateCartItemRequest
    {
        [Required(ErrorMessage = "CartItemId обязателен.")]
        public int CartItemId { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "Новое количество не может быть отрицательным.")]
        public int NewQuantity { get; set; }
    }

    // DTO для ответа с информацией об элементе корзины
    public class CartItemResponse
    {
        public int Id { get; set; }
        public int ProductDesignId { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public decimal ProductPrice { get; set; } // Цена из Product
        public string DesignName { get; set; } = string.Empty;
        public string BaseColorName { get; set; } = string.Empty;
        public string? PrimaryImageUrl { get; set; } // Изображение товара
        public string? DesignImageUrl { get; set; } // НОВОЕ ПОЛЕ: Изображение дизайна
        public int Quantity { get; set; } // Количество товара в корзине
        public int StockQuantity { get; set; } // Количество товара на складе
        public decimal PriceAtOrder { get; set; } // Цена ProductDesign
        public DateTime AddedDate { get; set; }
    }
}
