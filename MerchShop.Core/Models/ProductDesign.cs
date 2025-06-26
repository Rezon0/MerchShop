// MerchApi/Models/ProductDesign.cs
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic; // Для ICollection<Cart> и ICollection<ProductDesignOrder>

namespace MerchShop.Core.Models
{
    // Товар-Дизайн (с дополнительными атрибутами)
    public class ProductDesign
    {
        [Key]
        // Соответствует "ID ТД"
        public int Id { get; set; }

        // Внешние ключи
        public int ProductId { get; set; }
        public Product Product { get; set; } // Навигационное свойство

        public int DesignId { get; set; }
        public Design Design { get; set; } // Навигационное свойство

        // Соответствует "Координата X"
        public int CoordinateX { get; set; }

        // Соответствует "Координата Y"
        public int CoordinateY { get; set; }

        // Соответствует "Доступность"
        public bool IsAvailable { get; set; } // Переименовано для ясности

        // Навигационное свойство для связи "один ко многим" с Cart
        public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>(); // Изменено на CartItem

        // Навигационное свойство для связи "один ко многим" с ProductDesignOrder
        public ICollection<ProductDesignOrder> ProductDesignOrders { get; set; } = new List<ProductDesignOrder>();

        // Навигационное свойство для связи "один ко многим" с Review
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
    }
}
