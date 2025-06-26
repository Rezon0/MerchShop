// MerchApi/Models/ProductDesignOrder.cs
using System.ComponentModel.DataAnnotations;

namespace MerchShop.Core.Models
{
    // Элемент заказа (Товар-Дизайн в Заказе)
    public class ProductDesignOrder
    {
        [Key]
        // Соответствует "ID ТДЗ"
        public int Id { get; set; }

        // Внешние ключи
        public int OrderId { get; set; }
        public Order Order { get; set; } // Навигационное свойство

        public int ProductDesignId { get; set; }
        public ProductDesign ProductDesign { get; set; } // Навигационное свойство

        [Required]
        // Соответствует "Цена на момент оформления" (важно фиксировать цену)
        public decimal PriceAtOrder { get; set; }

        [Required]
        // Добавлено количество, так как в заказе обычно хранится количество одного и того же элемента
        public int Quantity { get; set; }
    }
}
