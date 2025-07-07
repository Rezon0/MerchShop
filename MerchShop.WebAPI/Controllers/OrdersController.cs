// MerchShop.WebAPI/Controllers/OrderController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MerchShop.Core.Data;
using MerchShop.Core.Models;
using MerchShop.WebAPI.DTOs;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace MerchShop.WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Все методы в этом контроллере требуют авторизации
    public class OrdersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public OrdersController(ApplicationDbContext context)
        {
            _context = context;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                throw new UnauthorizedAccessException("Не удалось определить ID пользователя.");
            }
            return userId;
        }

        /// <summary>
        /// Создает новый заказ из содержимого корзины текущего пользователя.
        /// </summary>
        /// <param name="request">Данные для создания заказа (например, PaymentMethodId).</param>
        /// <returns>Созданный заказ или сообщение об ошибке.</returns>
        [HttpPost]
        public async Task<ActionResult<OrderResponse>> CreateOrder([FromBody] CreateOrderRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var userId = GetCurrentUserId();

                // 1. Получаем элементы корзины пользователя
                var cartItems = await _context.CartItems
                    .Where(ci => ci.UserId == userId)
                    .Include(ci => ci.ProductDesign)
                        .ThenInclude(pd => pd.Product)
                    .Include(ci => ci.ProductDesign)
                        .ThenInclude(pd => pd.Design)
                    .Include(ci => ci.ProductDesign)
                        .ThenInclude(pd => pd.Product.BaseColor)
                    .ToListAsync();

                if (!cartItems.Any())
                {
                    return BadRequest(new { message = "Корзина пользователя пуста." });
                }

                // 2. Проверяем доступность товаров и рассчитываем общую сумму
                decimal totalAmount = 0;
                foreach (var item in cartItems)
                {
                    if (item.ProductDesign == null || !item.ProductDesign.IsAvailable || item.ProductDesign.Quantity < item.Quantity)
                    {
                        await transaction.RollbackAsync();
                        return BadRequest(new { message = $"Товар '{item.ProductDesign?.Product?.Name} - {item.ProductDesign?.Design?.Name}' недоступен или его нет в достаточном количестве." });
                    }
                    totalAmount += item.Quantity * item.ProductDesign.PriceAtOrder;
                }

                // 3. Проверяем существование метода оплаты
                var paymentMethod = await _context.PaymentMethods.FindAsync(request.PaymentMethodId);
                if (paymentMethod == null)
                {
                    await transaction.RollbackAsync();
                    return NotFound(new { message = "Указанный метод оплаты не найден." });
                }

                // 4. Получаем или создаем статус "В обработке"
                var initialStatus = await _context.Statuses.FirstOrDefaultAsync(s => s.Name == "В обработке");
                if (initialStatus == null)
                {
                    // Если статуса нет, можно создать его или вернуть ошибку
                    initialStatus = new Status { Name = "В обработке" };
                    _context.Statuses.Add(initialStatus);
                    await _context.SaveChangesAsync(); // Сохраняем статус, чтобы получить его ID
                }

                // 5. Создаем новый заказ
                var order = new Order
                {
                    UserId = userId,
                    StatusId = initialStatus.Id,
                    PaymentMethodId = request.PaymentMethodId,
                    CreationDateTime = DateTime.UtcNow,
                    // CompletionDateTime будет null по умолчанию
                };
                _context.Orders.Add(order);
                await _context.SaveChangesAsync(); // Сохраняем заказ, чтобы получить его ID

                // 6. Создаем элементы заказа на основе элементов корзины
                var productDesignOrders = new List<ProductDesignOrder>();
                foreach (var item in cartItems)
                {
                    productDesignOrders.Add(new ProductDesignOrder
                    {
                        OrderId = order.Id,
                        ProductDesignId = item.ProductDesignId,
                        Quantity = item.Quantity,
                        PriceAtOrder = item.ProductDesign.PriceAtOrder // Цена на момент заказа
                    });

                    // Опционально: уменьшаем количество товара на складе (ProductDesign.Quantity)
                    item.ProductDesign.Quantity -= item.Quantity;
                    _context.ProductDesigns.Update(item.ProductDesign);
                }
                _context.ProductDesignOrders.AddRange(productDesignOrders);
                await _context.SaveChangesAsync();

                // 7. Очищаем корзину пользователя
                _context.CartItems.RemoveRange(cartItems);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                // 8. Формируем ответ
                var response = new OrderResponse
                {
                    Id = order.Id,
                    StatusName = initialStatus.Name,
                    PaymentMethodName = paymentMethod.Name,
                    CreationDateTime = order.CreationDateTime,
                    CompletionDateTime = order.CompletionDateTime,
                    TotalAmount = totalAmount,
                    Items = productDesignOrders.Select(pdo => new ProductDesignOrderResponse
                    {
                        ProductDesignId = pdo.ProductDesignId,
                        ProductName = cartItems.FirstOrDefault(ci => ci.ProductDesignId == pdo.ProductDesignId)?.ProductDesign?.Product?.Name ?? "Неизвестный товар",
                        DesignName = cartItems.FirstOrDefault(ci => ci.ProductDesignId == pdo.ProductDesignId)?.ProductDesign?.Design?.Name ?? "Неизвестный дизайн",
                        BaseColorName = cartItems.FirstOrDefault(ci => ci.ProductDesignId == pdo.ProductDesignId)?.ProductDesign?.Product?.BaseColor?.Name ?? "Неизвестный цвет",
                        PrimaryImageUrl = cartItems.FirstOrDefault(ci => ci.ProductDesignId == pdo.ProductDesignId)?.ProductDesign?.Product?.PrimaryImageUrl,
                        Quantity = pdo.Quantity,
                        PriceAtOrder = pdo.PriceAtOrder
                    }).ToList()
                };

                return CreatedAtAction(nameof(GetOrderById), new { id = order.Id }, response);
            }
            catch (UnauthorizedAccessException ex)
            {
                await transaction.RollbackAsync();
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = $"Внутренняя ошибка сервера: {ex.Message}" });
            }
        }

        /// <summary>
        /// Получает список всех заказов текущего авторизованного пользователя.
        /// </summary>
        /// <returns>Список заказов пользователя.</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderResponse>>> GetUserOrders()
        {
            try
            {
                var userId = GetCurrentUserId();

                var orders = await _context.Orders
                    .Where(o => o.UserId == userId)
                    .Include(o => o.Status)
                    .Include(o => o.PaymentMethod)
                    .Include(o => o.ProductDesignOrders)
                        .ThenInclude(pdo => pdo.ProductDesign)
                            .ThenInclude(pd => pd.Product)
                                .ThenInclude(p => p.BaseColor)
                    .Include(o => o.ProductDesignOrders)
                        .ThenInclude(pdo => pdo.ProductDesign)
                            .ThenInclude(pd => pd.Design)
                    .OrderByDescending(o => o.CreationDateTime) // Сортируем по дате создания
                    .ToListAsync();

                if (!orders.Any())
                {
                    return Ok(new List<OrderResponse>());
                }

                var response = orders.Select(o => new OrderResponse
                {
                    Id = o.Id,
                    StatusName = o.Status.Name,
                    PaymentMethodName = o.PaymentMethod.Name,
                    CreationDateTime = o.CreationDateTime,
                    CompletionDateTime = o.CompletionDateTime,
                    TotalAmount = o.ProductDesignOrders.Sum(pdo => pdo.Quantity * pdo.PriceAtOrder),
                    Items = o.ProductDesignOrders.Select(pdo => new ProductDesignOrderResponse
                    {
                        ProductDesignId = pdo.ProductDesignId,
                        ProductName = pdo.ProductDesign.Product.Name,
                        DesignName = pdo.ProductDesign.Design.Name,
                        BaseColorName = pdo.ProductDesign.Product.BaseColor.Name,
                        PrimaryImageUrl = pdo.ProductDesign.Product.PrimaryImageUrl,
                        Quantity = pdo.Quantity,
                        PriceAtOrder = pdo.PriceAtOrder
                    }).ToList()
                }).ToList();

                return Ok(response);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Внутренняя ошибка сервера: {ex.Message}" });
            }
        }

        /// <summary>
        /// Получает детали конкретного заказа по его ID для текущего пользователя.
        /// </summary>
        /// <param name="id">ID заказа.</param>
        /// <returns>Детали заказа или сообщение об ошибке.</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<OrderResponse>> GetOrderById(int id)
        {
            try
            {
                var userId = GetCurrentUserId();

                var order = await _context.Orders
                    .Where(o => o.Id == id && o.UserId == userId)
                    .Include(o => o.Status)
                    .Include(o => o.PaymentMethod)
                    .Include(o => o.ProductDesignOrders)
                        .ThenInclude(pdo => pdo.ProductDesign)
                            .ThenInclude(pd => pd.Product)
                                .ThenInclude(p => p.BaseColor)
                    .Include(o => o.ProductDesignOrders)
                        .ThenInclude(pdo => pdo.ProductDesign)
                            .ThenInclude(pd => pd.Design)
                    .FirstOrDefaultAsync();

                if (order == null)
                {
                    return NotFound(new { message = "Заказ не найден или не принадлежит текущему пользователю." });
                }

                var response = new OrderResponse
                {
                    Id = order.Id,
                    StatusName = order.Status.Name,
                    PaymentMethodName = order.PaymentMethod.Name,
                    CreationDateTime = order.CreationDateTime,
                    CompletionDateTime = order.CompletionDateTime,
                    TotalAmount = order.ProductDesignOrders.Sum(pdo => pdo.Quantity * pdo.PriceAtOrder),
                    Items = order.ProductDesignOrders.Select(pdo => new ProductDesignOrderResponse
                    {
                        ProductDesignId = pdo.ProductDesignId,
                        ProductName = pdo.ProductDesign.Product.Name,
                        DesignName = pdo.ProductDesign.Design.Name,
                        BaseColorName = pdo.ProductDesign.Product.BaseColor.Name,
                        PrimaryImageUrl = pdo.ProductDesign.Product.PrimaryImageUrl,
                        Quantity = pdo.Quantity,
                        PriceAtOrder = pdo.PriceAtOrder
                    }).ToList()
                };

                return Ok(response);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Внутренняя ошибка сервера: {ex.Message}" });
            }
        }
    }
}
