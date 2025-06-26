// MerchApi/Models/CategoryProduct.cs
using System.ComponentModel.DataAnnotations;

namespace MerchShop.Core.Models
{
    // Соединительная таблица Категории-Товар
    public class CategoryProduct
    {
        [Key]
        // Соответствует "ID КТ"
        public int Id { get; set; }

        // Внешние ключи
        public int CategoryId { get; set; }
        public Category Category { get; set; } // Навигационное свойство

        public int ProductId { get; set; }
        public Product Product { get; set; } // Навигационное свойство
    }
}
