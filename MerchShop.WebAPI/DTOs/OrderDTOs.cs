// MerchShop.WebAPI/DTOs/OrderDTOs.cs
using System; // Добавлено: Для DateTime
using System.Collections.Generic; // Добавлено: Для ICollection
using System.ComponentModel.DataAnnotations;


namespace MerchShop.WebAPI.DTOs
{
    // DTO для создания заказа
    public class CreateOrderRequest
    {
        [Required(ErrorMessage = "PaymentMethodId обязателен.")]
        public int PaymentMethodId { get; set; }
        // Можно добавить дополнительные поля, если они будут нужны для создания заказа (например, адрес доставки)
    }

    // DTO для элемента заказа (внутри ответа о заказе)
    public class ProductDesignOrderResponse
    {
        public int ProductDesignId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string DesignName { get; set; } = string.Empty;
        public string BaseColorName { get; set; } = string.Empty;
        public string? PrimaryImageUrl { get; set; }
        public int Quantity { get; set; }
        public decimal PriceAtOrder { get; set; }
    }

    // DTO для ответа с информацией о заказе
    public class OrderResponse
    {
        public int Id { get; set; }
        public string StatusName { get; set; } = string.Empty;
        public string PaymentMethodName { get; set; } = string.Empty;
        public DateTime CreationDateTime { get; set; }
        public DateTime? CompletionDateTime { get; set; }
        public decimal TotalAmount { get; set; } // Общая сумма заказа
        public ICollection<ProductDesignOrderResponse> Items { get; set; } = new List<ProductDesignOrderResponse>();
    }
}