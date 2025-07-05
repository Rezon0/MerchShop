// MerchApi/Models/User.cs
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using System; // Для DateTime

namespace MerchShop.Core.Models
{
    // Пользователь
    public class User
    {
public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; }

        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; }

        [MaxLength(100)]
        public string MiddleName { get; set; } // Nullable

        [Required]
        public DateOnly DateOfBirth { get; set; }

        [Required]
        [MaxLength(16)]
        public string Phone { get; set; }

        [Required]
        [MaxLength(255)]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public bool GdprConsent { get; set; }

        // Добавляем поле для хешированного пароля
        [Required]
        [MaxLength(255)] // Длина хеша может варьироваться, 255 обычно достаточно
        public string PasswordHash { get; set; }

        // Навигационные свойства
        public ICollection<Order> Orders { get; set; }
        public ICollection<CartItem> CartItems { get; set; }
    }
}
