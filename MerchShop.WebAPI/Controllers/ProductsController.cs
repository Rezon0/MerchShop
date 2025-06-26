// MerchShop.WebAPI/Controllers/ProductsController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MerchShop.Core.Data;   // Для ApplicationDbContext
using MerchShop.Core.Models; // Для модели Product

namespace MerchShop.WebAPI.Controllers
{
    [ApiController] // Указывает, что это контроллер API
    [Route("api/[controller]")] // Определяет маршрут для контроллера: /api/Products
    public class ProductsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        // Конструктор: ApplicationDbContext внедряется через Dependency Injection
        public ProductsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Products
        // Этот эндпоинт будет возвращать список всех товаров.
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        {
            // Используем _context для доступа к DbSet<Product> и асинхронно получаем все товары из БД
            // Проект MerchShop.Core должен быть скомпилирован без ошибок для корректной работы
            return await _context.Products.ToListAsync();
        }

        // GET: api/Products/5
        // Этот эндпоинт будет возвращать один товар по его ID.
        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            // Ищем товар по ID в базе данных
            var product = await _context.Products.FindAsync(id);

            if (product == null)
            {
                // Если товар не найден, возвращаем 404 Not Found
                return NotFound();
            }

            // Если товар найден, возвращаем его
            return product;
        }

        // В будущем здесь можно добавить методы POST, PUT, DELETE для управления товарами
        /*
        // POST: api/Products
        // Добавление нового товара
        [HttpPost]
        public async Task<ActionResult<Product>> PostProduct(Product product)
        {
            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            // Возвращаем 201 CreatedAtAction с URL нового ресурса
            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
        }

        // PUT: api/Products/5
        // Обновление существующего товара
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProduct(int id, Product product)
        {
            if (id != product.Id)
            {
                return BadRequest(); // ID в маршруте не совпадает с ID в теле запроса
            }

            _context.Entry(product).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProductExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }
            return NoContent(); // 204 No Content - успешно, но без возврата тела
        }

        // DELETE: api/Products/5
        // Удаление товара
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound();
            }

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return NoContent(); // 204 No Content
        }

        private bool ProductExists(int id)
        {
            return _context.Products.Any(e => e.Id == id);
        }
        */
    }
}
