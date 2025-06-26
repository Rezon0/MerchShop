// MerchApi/Models/BaseColor.cs
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace MerchShop.Core.Models
{
    // Цвет основы
    public class BaseColor
    {
        [Key]
        // Соответствует "ID цвета основы"
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        // Соответствует "Наименование"
        public string Name { get; set; }

        [Required]
        [MaxLength(10)] // Предполагаем, что цвет - это HEX-код или название (например, "#FFFFFF" или "Black")
        // Соответствует "Цвет"
        public string ColorValue { get; set; } // Переименовано, чтобы избежать конфликта с именем класса

        // Навигационное свойство для связи "один ко многим" с Product
        public ICollection<Product> Products { get; set; } = new List<Product>();
    }
}
