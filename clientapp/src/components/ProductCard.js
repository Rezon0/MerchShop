// ProductCard.js
import React from 'react';
import { ShoppingCart } from 'lucide-react'; // Импорт иконки корзины

function ProductCard({ product, onAddToCart }) {
  // Выбираем первый ProductDesign для отображения изображения, если PrimaryImageUrl отсутствует
  const imageUrl = product.primaryImageUrl || (product.productDesigns && product.productDesigns.length > 0 ? product.productDesigns[0].design?.imageUrl : 'https://placehold.co/400x300/e0e0e0/ffffff?text=No+Image');

  // Определяем ProductDesignId для кнопки "Добавить в корзину"
  // Предполагаем, что для добавления в корзину мы выбираем первый доступный ProductDesign
  const defaultProductDesignId = product.productDesigns && product.productDesigns.length > 0 ? product.productDesigns[0].id : null;

  // Логируем ProductDesignId перед вызовом onAddToCart
  console.log('ProductCard: defaultProductDesignId for product', product.name, 'is', defaultProductDesignId);
  // НОВОЕ ЛОГИРОВАНИЕ: Проверяем, что onAddToCart является функцией
  console.log('ProductCard: onAddToCart prop received for product', product.name, 'is', typeof onAddToCart === 'function' ? 'a function' : onAddToCart);


  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
      <img
        src={imageUrl}
        alt={product.name}
        className="w-full h-48 object-cover"
        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x300/e0e0e0/ffffff?text=No+Image'; }}
      />
      <div className="p-4 flex-grow">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-2">{product.description}</p>
        <p className="text-gray-700 font-bold text-lg mb-4">{product.price} ₽</p>
        <p className="text-gray-500 text-sm">Цвет: {product.baseColorName}</p>
        {/* Дополнительная информация о дизайне, если нужно */}
        {product.productDesigns && product.productDesigns.length > 0 && (
          <p className="text-gray-500 text-sm">Дизайн: {product.productDesigns[0].design?.name}</p>
        )}
      </div>
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => onAddToCart(defaultProductDesignId, 1)} // Передаем ProductDesignId
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!defaultProductDesignId} // Отключаем кнопку, если нет ProductDesignId
        >
          <ShoppingCart className="mr-2" size={20} /> Добавить в корзину
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
