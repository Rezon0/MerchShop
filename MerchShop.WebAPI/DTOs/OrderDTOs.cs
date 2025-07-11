// MerchShop.WebAPI/DTOs/OrderDTOs.cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MerchShop.WebAPI.DTOs
{
    // DTO для запроса на оформление заказа с фронтенда
    public class PlaceOrderRequest
    {
        [Required(ErrorMessage = "Список ID товаров корзины обязателен.")]
        public List<int> CartItemIds { get; set; } // Список ID элементов корзины, которые нужно оформить

        [Required(ErrorMessage = "Метод оплаты обязателен.")]
        public string PaymentMethod { get; set; } // Строковое представление метода оплаты (например, "PaymentOnDelivery", "OnlinePayment")
    }

    // DTO для элемента заказа (внутри ответа о заказе)
    public class ProductDesignOrderResponse
    {
        public int ProductDesignId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string DesignName { get; set; } = string.Empty;
        public string BaseColorName { get; set; } = string.Empty;
        public string? PrimaryImageUrl { get; set; } // Изображение товара
        public string? DesignImageUrl { get; set; } // НОВОЕ ПОЛЕ: Изображение дизайна
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
