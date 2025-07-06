using System.ComponentModel.DataAnnotations;

namespace MerchShop.WebAPI.DTOs
{
    public class LoginRequest
    {
        [Required(ErrorMessage = "Email обязателен.")]
        [EmailAddress(ErrorMessage = "Неверный формат Email.")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Пароль обязателен.")]
        public string Password { get; set; }
    }
}