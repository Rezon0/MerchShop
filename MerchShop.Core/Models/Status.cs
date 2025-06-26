// MerchApi/Models/Status.cs
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace MerchShop.Core.Models
{
    // Статус Заказа
    public class Status
    {
        [Key]
        // Соответствует "ID статуса"
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        // Соответствует "Наименование"
        public string Name { get; set; }

        // Навигационное свойство для связи "один ко многим" с Order
        public ICollection<Order> Orders { get; set; } = new List<Order>();
    }
}
