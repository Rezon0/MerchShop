// MerchShop.WebAPI/Controllers/CartController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MerchShop.Core.Data;
using MerchShop.Core.Models;
using MerchShop.WebAPI.DTOs;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using Microsoft.Extensions.Logging; // Добавлено для ILogger

namespace MerchShop.WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Все методы в этом контроллере требуют авторизации
    public class CartController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<CartController> _logger; // Добавлено для логирования

        public CartController(ApplicationDbContext context, ILogger<CartController> logger) // Внедряем ILogger
        {
            _context = context;
            _logger = logger; // Инициализируем логгер
        }

        private int GetCurrentUserId()
        {
            // Извлекаем UserId из JWT токена
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            _logger.LogInformation("GetCurrentUserId: userIdClaim raw value: '{UserIdClaim}'", userIdClaim ?? "null"); // Логируем значение клейма

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                _logger.LogError("GetCurrentUserId: Failed to parse UserId from claim. Claim value: '{UserIdClaim}'", userIdClaim ?? "null"); // Логируем ошибку парсинга
                throw new UnauthorizedAccessException("Не удалось определить ID пользователя.");
            }
            _logger.LogInformation("GetCurrentUserId: Successfully parsed UserId: {UserId}", userId); // Логируем успешное получение ID
            return userId;
        }

        /// <summary>
        /// Получает корзину текущего авторизованного пользователя.
        /// </summary>
        /// <returns>Список элементов корзины пользователя.</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CartItemResponse>>> GetCart()
        {
            try
            {
                var userId = GetCurrentUserId();

                var cartItems = await _context.CartItems
                    .Where(ci => ci.UserId == userId)
                    .Include(ci => ci.ProductDesign)
                        .ThenInclude(pd => pd.Product)
                            .ThenInclude(p => p.BaseColor) // Включаем BaseColor для Product
                    .Include(ci => ci.ProductDesign)
                        .ThenInclude(pd => pd.Design) // Включаем Design для ProductDesign
                    .ToListAsync();

                if (!cartItems.Any())
                {
                    return Ok(new List<CartItemResponse>()); // Возвращаем пустой список, если корзина пуста
                }

                var response = cartItems.Select(ci => new CartItemResponse
                {
                    Id = ci.Id,
                    ProductDesignId = ci.ProductDesignId,
                    ProductId = ci.ProductDesign.ProductId,
                    ProductName = ci.ProductDesign.Product.Name,
                    ProductPrice = ci.ProductDesign.Product.Price, // Цена из Product
                    DesignName = ci.ProductDesign.Design.Name,
                    BaseColorName = ci.ProductDesign.Product.BaseColor.Name,
                    PrimaryImageUrl = ci.ProductDesign.Product.PrimaryImageUrl, // Если есть URL изображения
                    Quantity = ci.Quantity,
                    PriceAtOrder = ci.ProductDesign.PriceAtOrder, // Цена ProductDesign
                    AddedDate = ci.AddedDate
                }).ToList();

                return Ok(response);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogError(ex, "Unauthorized access attempt in GetCart: {Message}", ex.Message);
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Internal server error in GetCart: {Message}", ex.Message);
                return StatusCode(500, new { message = $"Внутренняя ошибка сервера: {ex.Message}" });
            }
        }

        /// <summary>
        /// Добавляет товар в корзину текущего пользователя или обновляет его количество.
        /// </summary>
        /// <param name="request">Данные для добавления/обновления элемента корзины.</param>
        /// <returns>Обновленный элемент корзины или сообщение об ошибке.</returns>
        [HttpPost("add")]
        public async Task<ActionResult<CartItemResponse>> AddToCart([FromBody] AddCartItemRequest request)
        {
            if (!ModelState.IsValid)
            {
                // Логируем ошибки ModelState
                foreach (var modelStateEntry in ModelState.Values)
                {
                    foreach (var error in modelStateEntry.Errors)
                    {
                        _logger.LogError("Model State Error: {ErrorMessage}", error.ErrorMessage);
                    }
                }
                return BadRequest(ModelState);
            }

            try
            {
                var userId = GetCurrentUserId();

                // Проверяем существование ProductDesign
                var productDesign = await _context.ProductDesigns
                    .Include(pd => pd.Product) // Включаем Product для доступа к Name, Price, PrimaryImageUrl
                    .Include(pd => pd.Design) // Включаем Design для Design.Name
                    .Include(pd => pd.Product.BaseColor) // Включаем BaseColor для BaseColor.Name
                    .FirstOrDefaultAsync(pd => pd.Id == request.ProductDesignId);

                if (productDesign == null)
                {
                    return NotFound(new { message = "Указанный товар-дизайн не найден." });
                }

                if (!productDesign.IsAvailable)
                {
                    return BadRequest(new { message = "Данный товар-дизайн недоступен для заказа." });
                }

                // Проверяем, есть ли уже такой товар в корзине пользователя
                var existingCartItem = await _context.CartItems
                    .Where(ci => ci.UserId == userId && ci.ProductDesignId == request.ProductDesignId)
                    .FirstOrDefaultAsync();

                if (existingCartItem != null)
                {
                    // Если товар уже есть, обновляем количество
                    existingCartItem.Quantity += request.Quantity;
                    _context.CartItems.Update(existingCartItem);
                }
                else
                {
                    // Если товара нет, создаем новый элемент корзины
                    var newCartItem = new CartItem
                    {
                        ProductDesignId = request.ProductDesignId,
                        UserId = userId,
                        Quantity = request.Quantity,
                        AddedDate = DateTime.UtcNow,
                        // PriceAtOrder берется из ProductDesign, так как это цена конкретной комбинации
                        // В модели CartItem нет PriceAtOrder, но ProductDesign имеет PriceAtOrder.
                        // Мы будем использовать ProductDesign.PriceAtOrder для ProductDesignOrder.
                        // Для CartItemResponse мы можем использовать ProductDesign.PriceAtOrder для отображения.
                    };
                    _context.CartItems.Add(newCartItem);
                }

                await _context.SaveChangesAsync();

                // Для ответа получаем обновленный/добавленный элемент корзины с полной информацией
                var updatedCartItem = await _context.CartItems
                    .Where(ci => ci.UserId == userId && ci.ProductDesignId == request.ProductDesignId)
                    .Include(ci => ci.ProductDesign)
                        .ThenInclude(pd => pd.Product)
                            .ThenInclude(p => p.BaseColor)
                    .Include(ci => ci.ProductDesign)
                        .ThenInclude(pd => pd.Design)
                    .FirstAsync();

                var response = new CartItemResponse
                {
                    Id = updatedCartItem.Id,
                    ProductDesignId = updatedCartItem.ProductDesignId,
                    ProductId = updatedCartItem.ProductDesign.ProductId,
                    ProductName = updatedCartItem.ProductDesign.Product.Name,
                    ProductPrice = updatedCartItem.ProductDesign.Product.Price,
                    DesignName = updatedCartItem.ProductDesign.Design.Name,
                    BaseColorName = updatedCartItem.ProductDesign.Product.BaseColor.Name,
                    PrimaryImageUrl = updatedCartItem.ProductDesign.Product.PrimaryImageUrl,
                    Quantity = updatedCartItem.Quantity,
                    PriceAtOrder = updatedCartItem.ProductDesign.PriceAtOrder, // Используем PriceAtOrder из ProductDesign
                    AddedDate = updatedCartItem.AddedDate
                };

                return Ok(response);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogError(ex, "Unauthorized access attempt in AddToCart: {Message}", ex.Message);
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Internal server error in AddToCart: {Message}", ex.Message);
                return StatusCode(500, new { message = $"Внутренняя ошибка сервера: {ex.Message}" });
            }
        }

        /// <summary>
        /// Обновляет количество конкретного товара в корзине пользователя.
        /// Если NewQuantity <= 0, элемент удаляется из корзины.
        /// </summary>
        /// <param name="request">Данные для обновления количества.</param>
        /// <returns>Обновленный элемент корзины или сообщение об успехе/ошибке.</returns>
        [HttpPut("update-quantity")]
        public async Task<ActionResult<CartItemResponse>> UpdateQuantity([FromBody] UpdateCartItemRequest request)
        {
            if (!ModelState.IsValid)
            {
                // Логируем ошибки ModelState
                foreach (var modelStateEntry in ModelState.Values)
                {
                    foreach (var error in modelStateEntry.Errors)
                    {
                        _logger.LogError("Model State Error: {ErrorMessage}", error.ErrorMessage);
                    }
                }
                return BadRequest(ModelState);
            }

            try
            {
                var userId = GetCurrentUserId();

                var cartItem = await _context.CartItems
                    .Where(ci => ci.Id == request.CartItemId && ci.UserId == userId)
                    .Include(ci => ci.ProductDesign)
                        .ThenInclude(pd => pd.Product)
                            .ThenInclude(p => p.BaseColor)
                    .Include(ci => ci.ProductDesign)
                        .ThenInclude(pd => pd.Design)
                    .FirstOrDefaultAsync();

                if (cartItem == null)
                {
                    return NotFound(new { message = "Элемент корзины не найден или не принадлежит текущему пользователю." });
                }

                if (request.NewQuantity <= 0)
                {
                    _context.CartItems.Remove(cartItem);
                    await _context.SaveChangesAsync();
                    return Ok(new { message = "Элемент корзины удален." });
                }
                else
                {
                    cartItem.Quantity = request.NewQuantity;
                    _context.CartItems.Update(cartItem);
                    await _context.SaveChangesAsync();

                    var response = new CartItemResponse
                    {
                        Id = cartItem.Id,
                        ProductDesignId = cartItem.ProductDesignId,
                        ProductId = cartItem.ProductDesign.ProductId,
                        ProductName = cartItem.ProductDesign.Product.Name,
                        ProductPrice = cartItem.ProductDesign.Product.Price,
                        DesignName = cartItem.ProductDesign.Design.Name,
                        BaseColorName = cartItem.ProductDesign.Product.BaseColor.Name,
                        PrimaryImageUrl = cartItem.ProductDesign.Product.PrimaryImageUrl,
                        Quantity = cartItem.Quantity,
                        PriceAtOrder = cartItem.ProductDesign.PriceAtOrder,
                        AddedDate = cartItem.AddedDate
                    };
                    return Ok(response);
                }
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogError(ex, "Unauthorized access attempt in UpdateQuantity: {Message}", ex.Message);
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Internal server error in UpdateQuantity: {Message}", ex.Message);
                return StatusCode(500, new { message = $"Внутренняя ошибка сервера: {ex.Message}" });
            }
        }

        /// <summary>
        /// Удаляет конкретный товар из корзины пользователя.
        /// </summary>
        /// <param name="id">ID элемента корзины для удаления.</param>
        /// <returns>Сообщение об успехе или ошибке.</returns>
        [HttpDelete("remove/{id}")]
        public async Task<ActionResult> RemoveFromCart(int id)
        {
            try
            {
                var userId = GetCurrentUserId();

                var cartItem = await _context.CartItems
                    .Where(ci => ci.Id == id && ci.UserId == userId)
                    .FirstOrDefaultAsync();

                if (cartItem == null)
                {
                    return NotFound(new { message = "Элемент корзины не найден или не принадлежит текущему пользователю." });
                }

                _context.CartItems.Remove(cartItem);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Элемент корзины успешно удален." });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogError(ex, "Unauthorized access attempt in RemoveFromCart: {Message}", ex.Message);
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Internal server error in RemoveFromCart: {Message}", ex.Message);
                return StatusCode(500, new { message = $"Внутренняя ошибка сервера: {ex.Message}" });
            }
        }
    }
}
