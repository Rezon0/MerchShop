// MerchApi/Models/Review.cs
using System.ComponentModel.DataAnnotations;

namespace MerchShop.Core.Models
{
    // Отзывы
    public class Review
    {
        [Key]
        // Соответствует "ID отзыва"
        public int Id { get; set; }

        [Required]
        [MaxLength(2000)] // Достаточно для длинного отзыва
        // Соответствует "Текст"
        public string Text { get; set; }

        [MaxLength(500)] // URL изображения (опционально)
        // Соответствует "URL изображения"
        public string? ImageUrl { get; set; } // Сделал nullable, так как изображение может отсутствовать

        // Внешний ключ к ProductDesign
        public int ProductDesignId { get; set; }
        public ProductDesign ProductDesign { get; set; } // Навигационное свойство
    }
}
