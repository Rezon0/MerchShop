// MerchShop.WebAPI/DTOs/CartItemDTOs.cs
using System; // Добавлено: Для типа DateTime
using System.ComponentModel.DataAnnotations;

namespace MerchShop.WebAPI.DTOs
{
    // DTO для добавления товара в корзину
    public class AddCartItemRequest
    {
        [Required(ErrorMessage = "ProductDesignId обязателен.")]
        public int ProductDesignId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Количество должно быть не менее 1.")]
        public int Quantity { get; set; } = 1;
    }

    // DTO для обновления количества товара в корзине
    public class UpdateCartItemRequest
    {
        [Required(ErrorMessage = "CartItemId обязателен.")]
        public int CartItemId { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "Количество не может быть отрицательным.")]
        public int NewQuantity { get; set; }
    }

    // DTO для ответа с элементом корзины (для отображения на фронтенде)
    public class CartItemResponse
    {
        public int Id { get; set; } // ID CartItem
        public int ProductDesignId { get; set; }
        public int ProductId { get; set; } // ID продукта
        public string ProductName { get; set; } = string.Empty;
        public decimal ProductPrice { get; set; } // Цена продукта (из Product)
        public string DesignName { get; set; } = string.Empty; // Название дизайна
        public string BaseColorName { get; set; } = string.Empty; // Название цвета основы
        public string? PrimaryImageUrl { get; set; } // URL изображения продукта
        public int Quantity { get; set; } // Количество в корзине
        public decimal PriceAtOrder { get; set; } // Цена ProductDesign на момент добавления в корзину
        public DateTime AddedDate { get; set; }
    }
}