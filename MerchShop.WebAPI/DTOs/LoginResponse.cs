namespace MerchShop.WebAPI.DTOs
{
    public class LoginResponse
    {
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty; // Сообщение об успехе/ошибке
        public int UserId { get; set; } // ID пользователя
        public string UserName { get; set; } = string.Empty; // Имя пользователя (например, FirstName)
    }
}