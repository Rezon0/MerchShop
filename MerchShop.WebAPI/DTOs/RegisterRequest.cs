// MerchShop.WebAPI/DTOs/RegisterRequest.cs
using System;
using System.ComponentModel.DataAnnotations;

namespace MerchShop.WebAPI.DTOs
{
    public class RegisterRequest
    {
        [Required(ErrorMessage = "Фамилия обязательна.")]
        [MaxLength(100, ErrorMessage = "Фамилия не может превышать 100 символов.")]
        public string LastName { get; set; }

        [Required(ErrorMessage = "Имя обязательно.")]
        [MaxLength(100, ErrorMessage = "Имя не может превышать 100 символов.")]
        public string FirstName { get; set; }

        [MaxLength(100, ErrorMessage = "Отчество не может превышать 100 символов.")]
        public string MiddleName { get; set; }

        [Required(ErrorMessage = "Дата рождения обязательна.")]
        [DataType(DataType.Date)]
        // Если DateOnly вызывает проблемы с десериализацией из строки "YYYY-MM-DD",
        // можно временно попробовать использовать DateTime и позже преобразовать
        // public DateTime DateOfBirth { get; set; }
        public DateOnly DateOfBirth { get; set; }


        [Required(ErrorMessage = "Телефон обязателен.")]
        [Phone(ErrorMessage = "Неверный формат телефона.")]
        [MaxLength(16, ErrorMessage = "Телефон не может превышать 16 символов.")]
        public string Phone { get; set; }

        [Required(ErrorMessage = "Email обязателен.")]
        [EmailAddress(ErrorMessage = "Неверный формат Email.")]
        [MaxLength(255, ErrorMessage = "Email не может превышать 255 символов.")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Согласие с GDPR обязательно.")]
        public bool GdprConsent { get; set; }

        // ЭТО ПОЛЕ, КОТОРОЕ ВЫЗЫВАЕТ ПРОБЛЕМУ
        [Required(ErrorMessage = "Пароль обязателен.")]
        [MinLength(6, ErrorMessage = "Пароль должен быть не менее 6 символов.")] // Пример минимальной длины
        // Возможно, здесь есть конфликт, если имя свойства не 'Password'
        // Убедитесь, что имя свойства точно 'Password'
        public string Password { get; set; }

        [Required(ErrorMessage = "Подтверждение пароля обязательно.")]
        [Compare("Password", ErrorMessage = "Пароли не совпадают.")]
        public string ConfirmPassword { get; set; }
    }
}
