// MerchShop.WebAPI/Controllers/AuthController.cs
using Microsoft.AspNetCore.Mvc;
using MerchShop.Core.Data;
using MerchShop.Core.Models;
using MerchShop.WebAPI.DTOs;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore; // Для Where и FirstOrDefaultAsync
using BCrypt.Net; // Для хеширования паролей - нужно установить пакет!

namespace MerchShop.WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // Маршрут: /api/Auth
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AuthController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Регистрирует нового пользователя.
        /// </summary>
        /// <param name="request">Данные для регистрации пользователя.</param>
        /// <returns>Статус 200 OK при успешной регистрации, иначе 400 Bad Request.</returns>
        [HttpPost("register")] // Маршрут: /api/Auth/register
        public async Task<ActionResult> Register([FromBody] RegisterRequest request)
        {
            // 1. Валидация входных данных DTO
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState); // Возвращает ошибки валидации
            }

            // 2. Проверка, существует ли пользователь с таким email
            var existingUser = await _context.Users
                                             .Where(u => u.Email == request.Email)
                                             .FirstOrDefaultAsync();

            if (existingUser != null)
            {
                // Пользователь с таким email уже существует
                return BadRequest(new { message = "Пользователь с таким Email уже зарегистрирован." });
            }

            // 3. Хеширование пароля
            // Установите пакет BCrypt.Net-Next:
            // dotnet add package BCrypt.Net-Next
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

            // 4. Создание новой сущности пользователя
            var newUser = new User
            {
                LastName = request.LastName,
                FirstName = request.FirstName,
                MiddleName = request.MiddleName,
                DateOfBirth = request.DateOfBirth,
                Phone = request.Phone,
                Email = request.Email,
                GdprConsent = request.GdprConsent,
                PasswordHash = hashedPassword // Сохраняем хешированный пароль
            };

            // 5. Сохранение пользователя в базу данных
            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            // 6. Успешный ответ
            // В реальном приложении здесь может быть генерация JWT-токена
            // и возвращение его клиенту для автоматического входа.
            return Ok(new { message = "Регистрация прошла успешно!" });
        }
    }
}