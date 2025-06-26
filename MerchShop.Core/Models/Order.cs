// MerchApi/Models/Order.cs
using System.ComponentModel.DataAnnotations;
using System; // Для DateTime
using System.Collections.Generic;

namespace MerchShop.Core.Models
{
    // Заказ
    public class Order
    {
        [Key]
        // Соответствует "ID заказа"
        public int Id { get; set; }

        // Внешние ключи
        public int StatusId { get; set; }
        public Status Status { get; set; } // Навигационное свойство

        public int PaymentMethodId { get; set; }
        public PaymentMethod PaymentMethod { get; set; } // Навигационное свойство

        public int UserId { get; set; }
        public User User { get; set; } // Навигационное свойство

        [Required]
        // Соответствует "Дата и время создания"
        public DateTime CreationDateTime { get; set; }

        // Соответствует "Дата и время окончания" (nullable, если заказ может быть незавершенным)
        public DateTime? CompletionDateTime { get; set; } // Сделал nullable

        // Навигационное свойство для связи "многие ко многим" с ProductDesign через ProductDesignOrder
        public ICollection<ProductDesignOrder> ProductDesignOrders { get; set; } = new List<ProductDesignOrder>();
    }
}
