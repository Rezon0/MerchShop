// MerchApi/Models/User.cs
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using System; // Для DateTime

namespace MerchShop.Core.Models
{
    // Пользователь
    public class User
    {
        [Key]
        // Соответствует "ID пользователя"
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        // Соответствует "Фамилия"
        public string LastName { get; set; }

        [Required]
        [MaxLength(100)]
        // Соответствует "Имя"
        public string FirstName { get; set; }

        [MaxLength(100)]
        // Соответствует "Отчество" (может быть null)
        public string? MiddleName { get; set; }

        [Required]
        // Соответствует "Дата рождения"
        public DateOnly DateOfBirth { get; set; } // Или DateOnly если используете .NET 6+ и не нужен Time

        [Required]
        [MaxLength(16)] // Например, "+7(XXX)XXX-XX-XX"
        // Соответствует "Телефон"
        public string Phone { get; set; }

        [Required]
        [EmailAddress] // Атрибут для валидации формата email
        [MaxLength(255)]
        // Соответствует "Email"
        public string Email { get; set; }

        [Required]
        // Соответствует "Согласие об обработке ПД"
        public bool GdprConsent { get; set; } // General Data Protection Regulation (GDPR)

        // Навигационные свойства для связей "один ко многим"
        public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>(); // Изменено на CartItem
        public ICollection<Order> Orders { get; set; } = new List<Order>();
    }
}
