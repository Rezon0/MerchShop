// MerchShop.Core/Models/User.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace MerchShop.Core.Models
{
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
        public string MiddleName { get; set; }

        [Required]
        // ИЗМЕНЕНО: Меняем DateOnly на DateTime
        public DateTime DateOfBirth { get; set; }

        [Required]
        [MaxLength(16)]
        public string Phone { get; set; }

        [Required]
        [MaxLength(255)]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public bool GdprConsent { get; set; }

        [Required]
        [MaxLength(255)]
        public string PasswordHash { get; set; }

        // Поля для Refresh Token
        [MaxLength(255)]
        public string? RefreshToken { get; set; }

        public DateTime? RefreshTokenExpiryTime { get; set; }

        // Навигационные свойства
        public ICollection<Order> Orders { get; set; } = new List<Order>();
        public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
    }
}
