// MerchApi/Data/ApplicationDbContext.cs
using MerchShop.Core.Models;
using Microsoft.EntityFrameworkCore; // Убедитесь, что эта директива using указывает на вашу папку Models

namespace MerchShop.Core.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // DbSets для всех ваших моделей
        public DbSet<Product> Products { get; set; }
        public DbSet<Category> Categories { get; set; } // Исправлено на Categories
        public DbSet<BaseColor> BaseColors { get; set; }
        public DbSet<Design> Designs { get; set; }
        public DbSet<CategoryProduct> CategoryProducts { get; set; } // Исправлена опечатка
        public DbSet<ProductDesign> ProductDesigns { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<Status> Statuses { get; set; }
        public DbSet<PaymentMethod> PaymentMethods { get; set; }
        public DbSet<Order> Orders { get; set; } // Исправлено на Orders
        public DbSet<ProductDesignOrder> ProductDesignOrders { get; set; }
        public DbSet<Review> Reviews { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // =========================================================================
            // КОНФИГУРАЦИЯ СВЯЗЕЙ В СООТВЕТСТВИИ С ВАШЕЙ ЛОГИЧЕСКОЙ СХЕМОЙ БД
            // =========================================================================

            // Product (Товар) - BaseColor (Цвет основы): Один-ко-многим
            modelBuilder.Entity<Product>()
                .HasOne(p => p.BaseColor)
                .WithMany(bc => bc.Products)
                .HasForeignKey(p => p.BaseColorId);

            // Category (Категории) - CategoryProduct (Категории-Товар) - Product (Товар)
            // Многие-ко-многим через соединительную таблицу CategoryProduct
            modelBuilder.Entity<CategoryProduct>()
                .HasOne(cp => cp.Category)
                .WithMany(c => c.CategoryProducts)
                .HasForeignKey(cp => cp.CategoryId);

            modelBuilder.Entity<CategoryProduct>()
                .HasOne(cp => cp.Product)
                .WithMany(p => p.CategoryProducts)
                .HasForeignKey(cp => cp.ProductId);

            // Product (Товар) - ProductDesign (Товар-Дизайн) - Design (Дизайн)
            // Многие-ко-многим через соединительную таблицу ProductDesign (с атрибутами)
            modelBuilder.Entity<ProductDesign>()
                .HasOne(pd => pd.Product)
                .WithMany(p => p.ProductDesigns)
                .HasForeignKey(pd => pd.ProductId);

            modelBuilder.Entity<ProductDesign>()
                .HasOne(pd => pd.Design)
                .WithMany(d => d.ProductDesigns)
                .HasForeignKey(pd => pd.DesignId);

            // User (Пользователь) - CartItem (Элемент корзины): Один-ко-многим
            modelBuilder.Entity<CartItem>()
                .HasOne(ci => ci.User)
                .WithMany(u => u.CartItems)
                .HasForeignKey(ci => ci.UserId);

            // ProductDesign (Товар-Дизайн) - CartItem (Элемент корзины): Один-ко-многим
            modelBuilder.Entity<CartItem>()
                .HasOne(ci => ci.ProductDesign)
                .WithMany(pd => pd.CartItems)
                .HasForeignKey(ci => ci.ProductDesignId);

            // User (Пользователь) - Order (Заказ): Один-ко-многим
            modelBuilder.Entity<Order>()
                .HasOne(o => o.User)
                .WithMany(u => u.Orders)
                .HasForeignKey(o => o.UserId);

            // Status (Статус) - Order (Заказ): Один-ко-многим
            modelBuilder.Entity<Order>()
                .HasOne(o => o.Status)
                .WithMany(s => s.Orders)
                .HasForeignKey(o => o.StatusId);

            // PaymentMethod (Способ оплаты) - Order (Заказ): Один-ко-многим
            modelBuilder.Entity<Order>()
                .HasOne(o => o.PaymentMethod)
                .WithMany(pm => pm.Orders)
                .HasForeignKey(o => o.PaymentMethodId);

            // Order (Заказ) - ProductDesignOrder (Элемент Заказа) - ProductDesign (Товар-Дизайн)
            // Многие-ко-многим через соединительную таблицу ProductDesignOrder (с атрибутами)
            modelBuilder.Entity<ProductDesignOrder>()
                .HasOne(pdo => pdo.Order)
                .WithMany(o => o.ProductDesignOrders)
                .HasForeignKey(pdo => pdo.OrderId);

            modelBuilder.Entity<ProductDesignOrder>()
                .HasOne(pdo => pdo.ProductDesign)
                .WithMany(pd => pd.ProductDesignOrders)
                .HasForeignKey(pdo => pdo.ProductDesignId);

            // ProductDesign (Товар-Дизайн) - Review (Отзывы): Один-ко-многим
            modelBuilder.Entity<Review>()
                .HasOne(r => r.ProductDesign)
                .WithMany(pd => pd.Reviews)
                .HasForeignKey(r => r.ProductDesignId);

            // =========================================================================

            base.OnModelCreating(modelBuilder);
        }
    }
}
