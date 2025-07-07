// MerchShop.WebAPI/Controllers/ProductsController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MerchShop.Core.Data;   // Для ApplicationDbContext
using MerchShop.Core.Models; // Для модели Product, ProductDesign, Design
using MerchShop.WebAPI.DTOs; // Добавлено для использования DTOs
using System.Linq; // Добавлено для LINQ-методов Select

namespace MerchShop.WebAPI.Controllers
{
    [ApiController] // Указывает, что это контроллер API
    [Route("api/[controller]")] // Определяет маршрут для контроллера: /api/Products
    public class ProductsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        // Конструктор: внедряем ApplicationDbContext через DI
        public ProductsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Products
        // Этот эндпоинт будет возвращать список всех товаров,
        // включая их ProductDesigns и связанные Designs для изображений, используя DTOs.
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductResponseDto>>> GetProducts()
        {
            var products = await _context.Products
                                 .Include(p => p.BaseColor) // Включаем BaseColor для получения имени
                                 .Include(p => p.ProductDesigns)
                                     .ThenInclude(pd => pd.Design)
                                 .ToListAsync();

            // Маппинг моделей Product на ProductResponseDto
            var productDtos = products.Select(p => new ProductResponseDto
            {
                Id = p.Id,
                Name = p.Name,
                Price = p.Price,
                Description = p.Description,
                BaseColorId = p.BaseColorId,
                BaseColorName = p.BaseColor.Name, // Получаем имя цвета
                PrimaryImageUrl = p.PrimaryImageUrl,
                ProductDesigns = p.ProductDesigns.Select(pd => new ProductDesignResponseDto
                {
                    Id = pd.Id,
                    ProductId = pd.ProductId,
                    DesignId = pd.DesignId,
                    Design = pd.Design != null ? new DesignResponseDto
                    {
                        Id = pd.Design.Id,
                        Name = pd.Design.Name,
                        ImageUrl = pd.Design.ImageUrl
                    } : null,
                    CoordinateX = pd.CoordinateX,
                    CoordinateY = pd.CoordinateY,
                    IsAvailable = pd.IsAvailable,
                    PriceAtOrder = pd.PriceAtOrder,
                    Quantity = pd.Quantity
                }).ToList()
            }).ToList();

            return Ok(productDtos);
        }

        // GET: api/Products/5
        // Этот эндпоинт будет возвращать один товар по его ID,
        // также включая ProductDesigns и Designs, используя DTOs.
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductResponseDto>> GetProduct(int id)
        {
            // Ищем товар по ID в базе данных, включая ProductDesigns и Designs
            var product = await _context.Products
                                        .Include(p => p.BaseColor) // Включаем BaseColor для получения имени
                                        .Include(p => p.ProductDesigns)
                                            .ThenInclude(pd => pd.Design)
                                        .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
            {
                // Если товар не найден, возвращаем 404 Not Found
                return NotFound();
            }

            // Маппинг модели Product на ProductResponseDto
            var productDto = new ProductResponseDto
            {
                Id = product.Id,
                Name = product.Name,
                Price = product.Price,
                Description = product.Description,
                BaseColorId = product.BaseColorId,
                BaseColorName = product.BaseColor.Name, // Получаем имя цвета
                PrimaryImageUrl = product.PrimaryImageUrl,
                ProductDesigns = product.ProductDesigns.Select(pd => new ProductDesignResponseDto
                {
                    Id = pd.Id,
                    ProductId = pd.ProductId,
                    DesignId = pd.DesignId,
                    Design = pd.Design != null ? new DesignResponseDto
                    {
                        Id = pd.Design.Id,
                        Name = pd.Design.Name,
                        ImageUrl = pd.Design.ImageUrl
                    } : null,
                    CoordinateX = pd.CoordinateX,
                    CoordinateY = pd.CoordinateY,
                    IsAvailable = pd.IsAvailable,
                    PriceAtOrder = pd.PriceAtOrder,
                    Quantity = pd.Quantity
                }).ToList()
            };

            // Если товар найден, возвращаем его DTO
            return Ok(productDto);
        }

        // POST api/Products
        // Добавление нового товара в базу данных
        // Примечание: Для POST-запросов обычно используется отдельный DTO (CreateProductRequest),
        // чтобы избежать проблем с безопасностью (over-posting) и упростить входные данные.
        // Здесь для простоты оставляем Product, но в реальном приложении рекомендуется DTO.
        [HttpPost]
        public async Task<ActionResult<Product>> PostProduct(Product product)
        {
            // Поскольку дизайн товара может быть связан после создания,
            // или мы ожидаем, что ProductDesign будет добавлен отдельно,
            // здесь просто добавляем Product.
            // Если ProductDesigns передаются в теле запроса POST, EF Core
            // может автоматически добавить их, если они правильно сформированы.
            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            // Возвращаем ответ 201 CreatedAtAction, который указывает URL нового ресурса
            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
        }
    }
}
