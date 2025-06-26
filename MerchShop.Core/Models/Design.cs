// MerchApi/Models/Design.cs
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace MerchShop.Core.Models
{
    // Дизайн
    public class Design
    {
        [Key]
        // Соответствует "ID дизайна"
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        // Соответствует "Наименование"
        public string Name { get; set; }

        [Required]
        [MaxLength(500)] // URL изображения
        // Соответствует "URL изображения"
        public string ImageUrl { get; set; }

        // Навигационное свойство для связи "многие ко многим" с Product через ProductDesign
        public ICollection<ProductDesign> ProductDesigns { get; set; } = new List<ProductDesign>();
    }
}
