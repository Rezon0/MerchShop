// MerchApi/Models/Product.cs
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace MerchShop.Core.Models
{
    // Товар
    public class Product
    {
        [Key]
        // Соответствует "ID товара"
        public int Id { get; set; }

        [Required]
        [MaxLength(200)] // Увеличил длину, так как "Футболка Космический Путешественник" может быть длинным
        // Соответствует "Наименование"
        public string Name { get; set; }

        [Required]
        // Соответствует "Цена"
        public decimal Price { get; set; }

        [MaxLength(1000)] // Увеличил длину для более полного описания
        // Соответствует "Описание" (хотя в схеме нет, но у вас в React есть `description`)
        public string? Description { get; set; } // Сделал nullable для гибкости

        // Внешний ключ к BaseColor (Цвет основы)
        public int BaseColorId { get; set; }
        public BaseColor BaseColor { get; set; } // Навигационное свойство

        // Навигационное свойство для связи "многие ко многим" с Category через CategoryProduct
        public ICollection<CategoryProduct> CategoryProducts { get; set; } = new List<CategoryProduct>();

        // Навигационное свойство для связи "многие ко многим" с Design через ProductDesign
        public ICollection<ProductDesign> ProductDesigns { get; set; } = new List<ProductDesign>();

        // Для URL изображения можно использовать отдельное поле здесь,
        // если оно относится к самому товару, а не к дизайну на товаре.
        // Или, как в вашей схеме, изображение привязано к "Дизайну".
        // Если вам нужно изображение основного товара (без дизайна), можно добавить:
        [MaxLength(500)]
        public string? PrimaryImageUrl { get; set; }
    }
}
