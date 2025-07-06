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
        // ИЗМЕНЕНО: Меняем DateOnly на DateTime, чтобы соответствовать модели User
        public DateTime DateOfBirth { get; set; }


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

        [Required(ErrorMessage = "Пароль обязателен.")]
        [MinLength(6, ErrorMessage = "Пароль должен быть не менее 6 символов.")]
        public string Password { get; set; }

        [Required(ErrorMessage = "Подтверждение пароля обязательно.")]
        [Compare("Password", ErrorMessage = "Пароли не совпадают.")]
        public string ConfirmPassword { get; set; }
    }
}
