// MerchApi/Models/CartItem.cs
using System.ComponentModel.DataAnnotations;
using System; // Для DateTime

namespace MerchShop.Core.Models
{
    // Элемент корзины (одна запись для одного экземпляра Товар-Дизайн в корзине пользователя)
    public class CartItem
    {
        [Key]
        // Соответствует "ID ТДК"
        public int Id { get; set; }

        // Внешний ключ к ProductDesign
        public int ProductDesignId { get; set; }
        public ProductDesign ProductDesign { get; set; } // Навигационное свойство

        // Внешний ключ к User
        public int UserId { get; set; }
        public User User { get; set; } // Навигационное свойство

        [Required]
        // Соответствует "Дата добавления"
        public DateTime AddedDate { get; set; } // Переименовано для ясности

        [Required]
        // Добавлено количество, так как в корзине обычно хранится количество одного и того же элемента
        public int Quantity { get; set; } = 1;
    }
}
