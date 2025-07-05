// MerchShop.WebAPI/Controllers/ProductsController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MerchShop.Core.Data;   // Для ApplicationDbContext
using MerchShop.Core.Models; // Для модели Product, ProductDesign, Design

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
        // включая их ProductDesigns и связанные Designs для изображений.
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        {
            // Используем _context для доступа к DbSet<Product>
            // Включаем (Include) связанные ProductDesigns
            // Затем включаем (ThenInclude) связанные Designs для получения ImageUrl
            return await _context.Products
                                 .Include(p => p.ProductDesigns)
                                     .ThenInclude(pd => pd.Design)
                                 .ToListAsync();
        }

        // GET: api/Products/5
        // Этот эндпоинт будет возвращать один товар по его ID,
        // также включая ProductDesigns и Designs.
        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            // Ищем товар по ID в базе данных, включая ProductDesigns и Designs
            var product = await _context.Products
                                        .Include(p => p.ProductDesigns)
                                            .ThenInclude(pd => pd.Design)
                                        .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
            {
                // Если товар не найден, возвращаем 404 Not Found
                return NotFound();
            }

            // Если товар найден, возвращаем его
            return product;
        }

        // POST api/Products
        // Добавление нового товара в базу данных
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
