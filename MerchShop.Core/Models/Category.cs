// MerchApi/Models/Category.cs
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic; // Для List<T>

namespace MerchShop.Core.Models
{
    // Категории
    public class Category
    {
        [Key]
        // Соответствует "ID категории"
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        // Соответствует "Наименование"
        public string Name { get; set; }

        // Навигационное свойство для связи "многие ко многим" с Product через CategoryProduct
        public ICollection<CategoryProduct> CategoryProducts { get; set; } = new List<CategoryProduct>();
    }
}
