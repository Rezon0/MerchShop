// MerchApi/Models/PaymentMethod.cs
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace MerchShop.Core.Models
{
    // Способ оплаты
    public class PaymentMethod
    {
        [Key]
        // Соответствует "ID способа оплаты"
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        // Соответствует "Наименование"
        public string Name { get; set; }

        // Навигационное свойство для связи "один ко многим" с Order
        public ICollection<Order> Orders { get; set; } = new List<Order>();
    }
}
