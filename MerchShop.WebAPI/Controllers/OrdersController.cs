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
        /// Создает новый заказ из выбранных элементов корзины текущего пользователя.
        /// </summary>
        /// <param name="request">Данные для создания заказа (список ID элементов корзины и метод оплаты).</param>
        /// <returns>Созданный заказ или сообщение об ошибке.</returns>
        [HttpPost("place-order")]
        public async Task<ActionResult<OrderResponse>> PlaceOrder([FromBody] PlaceOrderRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var userId = GetCurrentUserId();

                var cartItems = await _context.CartItems
                    .Where(ci => ci.UserId == userId && request.CartItemIds.Contains(ci.Id))
                    .Include(ci => ci.ProductDesign)
                        .ThenInclude(pd => pd.Product)
                    .Include(ci => ci.ProductDesign)
                        .ThenInclude(pd => pd.Design)
                    .Include(ci => ci.ProductDesign)
                        .ThenInclude(pd => pd.Product.BaseColor)
                    .ToListAsync();

                if (!cartItems.Any())
                {
                    return BadRequest(new { message = "Не выбраны товары для оформления заказа или они не найдены в вашей корзине." });
                }

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

                int? paymentMethodId = null;
                if (request.PaymentMethod == "PaymentOnDelivery")
                {
                    var paymentOnDelivery = await _context.PaymentMethods.FirstOrDefaultAsync(pm => pm.Name == "Оплата при получении");
                    if (paymentOnDelivery == null)
                    {
                        paymentOnDelivery = new PaymentMethod { Name = "Оплата при получении" };
                        _context.PaymentMethods.Add(paymentOnDelivery);
                        await _context.SaveChangesAsync();
                    }
                    paymentMethodId = paymentOnDelivery.Id;
                }
                else if (request.PaymentMethod == "OnlinePayment")
                {
                    var onlinePayment = await _context.PaymentMethods.FirstOrDefaultAsync(pm => pm.Name == "Онлайн оплата");
                    if (onlinePayment == null)
                    {
                        onlinePayment = new PaymentMethod { Name = "Онлайн оплата" };
                        _context.PaymentMethods.Add(onlinePayment);
                        await _context.SaveChangesAsync();
                    }
                    paymentMethodId = onlinePayment.Id;
                }
                else
                {
                    await transaction.RollbackAsync();
                    return BadRequest(new { message = "Неверный метод оплаты." });
                }

                if (!paymentMethodId.HasValue)
                {
                    await transaction.RollbackAsync();
                    return BadRequest(new { message = "Не удалось определить метод оплаты." });
                }

                var initialStatus = await _context.Statuses.FirstOrDefaultAsync(s => s.Name == "В обработке");
                if (initialStatus == null)
                {
                    initialStatus = new Status { Name = "В обработке" };
                    _context.Statuses.Add(initialStatus);
                    await _context.SaveChangesAsync();
                }

                var order = new Order
                {
                    UserId = userId,
                    StatusId = initialStatus.Id,
                    PaymentMethodId = paymentMethodId.Value,
                    CreationDateTime = DateTime.UtcNow,
                };
                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                var productDesignOrders = new List<ProductDesignOrder>();
                foreach (var item in cartItems)
                {
                    productDesignOrders.Add(new ProductDesignOrder
                    {
                        OrderId = order.Id,
                        ProductDesignId = item.ProductDesignId,
                        Quantity = item.Quantity,
                        PriceAtOrder = item.ProductDesign.PriceAtOrder
                    });

                    item.ProductDesign.Quantity -= item.Quantity;
                    _context.ProductDesigns.Update(item.ProductDesign);
                }
                _context.ProductDesignOrders.AddRange(productDesignOrders);
                await _context.SaveChangesAsync();

                _context.CartItems.RemoveRange(cartItems);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                var response = new OrderResponse
                {
                    Id = order.Id,
                    StatusName = initialStatus.Name,
                    PaymentMethodName = (await _context.PaymentMethods.FindAsync(paymentMethodId.Value))?.Name ?? request.PaymentMethod,
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
                        DesignImageUrl = cartItems.FirstOrDefault(ci => ci.ProductDesignId == pdo.ProductDesignId)?.ProductDesign?.Design?.ImageUrl, // НОВОЕ: Передаем URL изображения дизайна
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
                Console.WriteLine($"Ошибка при оформлении заказа: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
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
                    .OrderByDescending(o => o.CreationDateTime)
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
                        DesignImageUrl = pdo.ProductDesign.Design?.ImageUrl, // НОВОЕ: Передаем URL изображения дизайна
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
                        DesignImageUrl = pdo.ProductDesign.Design?.ImageUrl, // НОВОЕ: Передаем URL изображения дизайна
                        Quantity = pdo.Quantity,
                        PriceAtOrder = pdo.ProductDesign.PriceAtOrder
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
