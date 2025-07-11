// ProductCard.js
import React from 'react';
import { ShoppingCart } from 'lucide-react'; // Импорт иконки корзины

function ProductCard({ product, onAddToCart }) {
  // Выбираем первый ProductDesign для отображения изображения и количества на складе
  const defaultProductDesign = product.productDesigns && product.productDesigns.length > 0 ? product.productDesigns[0] : null;
  const imageUrl = product.primaryImageUrl || (defaultProductDesign?.design?.imageUrl || 'https://placehold.co/400x300/e0e0e0/ffffff?text=No+Image');
  const stockQuantity = defaultProductDesign ? defaultProductDesign.quantity : 0;
  const defaultProductDesignId = defaultProductDesign ? defaultProductDesign.id : null;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
      <img
        src={imageUrl}
        alt={product.name}
        className="w-full h-48 object-cover"
        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x300/e0e0e0/ffffff?text=Нет+изображения'; }}
      />
      <div className="p-4 flex-grow">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-2">{product.description}</p>
        <p className="text-gray-700 font-bold text-lg mb-4">{product.price} ₽</p>
        <p className="text-gray-500 text-sm">Цвет: {product.baseColorName}</p>
        {defaultProductDesign && (
          <p className="text-gray-500 text-sm">Дизайн: {defaultProductDesign.design?.name}</p>
        )}
        {/* НОВОЕ: Отображение количества на складе */}
        <p className={`text-sm font-semibold mt-2 ${stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
          На складе: {stockQuantity} шт.
        </p>
      </div>
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => onAddToCart(defaultProductDesignId, 1)}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!defaultProductDesignId || stockQuantity === 0} // НОВОЕ: Отключаем кнопку, если нет в наличии
        >
          <ShoppingCart className="mr-2" size={20} /> Добавить в корзину
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
