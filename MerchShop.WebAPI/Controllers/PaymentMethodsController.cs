// MerchShop.WebAPI/Controllers/PaymentMethodsController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MerchShop.Core.Data;
using MerchShop.Core.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace MerchShop.WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Требуем авторизации для получения методов оплаты
    public class PaymentMethodsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PaymentMethodsController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Получает список всех доступных методов оплаты.
        /// </summary>
        /// <returns>Список методов оплаты.</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PaymentMethod>>> GetPaymentMethods()
        {
            try
            {
                var paymentMethods = await _context.PaymentMethods.ToListAsync();
                return Ok(paymentMethods);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Внутренняя ошибка сервера: {ex.Message}" });
            }
        }
    }
}
