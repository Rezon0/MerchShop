// src/pages/CartPage.js
import React, { useContext, useEffect, useState } from 'react';
import { CartContext, AuthContext } from '../App';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function CartPage({ API_BASE_URL }) {
  const { cartItems, removeFromCart, updateCartItemQuantity, fetchCartItems } = useContext(CartContext);
  const { isLoggedIn } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCartItems, setSelectedCartItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('CartPage useEffect: isLoggedIn state:', isLoggedIn);
    const loadCart = async () => {
      setLoading(true);
      setError(null);
      if (isLoggedIn) {
        try {
          await fetchCartItems();
        } catch (err) {
          setError('Не удалось загрузить корзину. Пожалуйста, попробуйте позже.');
          console.error('Error loading cart:', err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setError('Пожалуйста, войдите, чтобы просмотреть и управлять вашей корзиной.');
      }
    };
    loadCart();
  }, [fetchCartItems, isLoggedIn]);

  const handleQuantityChange = async (cartItemId, currentQuantity, delta) => {
    const newQuantity = currentQuantity + delta;
    if (newQuantity >= 0) {
      await updateCartItemQuantity(cartItemId, newQuantity);
    }
  };

  const handleCheckboxChange = (cartItemId) => {
    setSelectedCartItems(prevSelected => {
      if (prevSelected.includes(cartItemId)) {
        return prevSelected.filter(id => id !== cartItemId);
      } else {
        return [...prevSelected, cartItemId];
      }
    });
  };

  const handleSelectAllChange = (e) => {
    if (e.target.checked) {
      // Выбираем только те товары, которые доступны для заказа (stockQuantity > 0)
      setSelectedCartItems(cartItems.filter(item => item.stockQuantity > 0).map(item => item.id));
    } else {
      setSelectedCartItems([]);
    }
  };

  // Проверяем, выбраны ли все доступные товары
  const availableItems = cartItems.filter(item => item.stockQuantity > 0);
  const isAllSelected = availableItems.length > 0 && selectedCartItems.length === availableItems.length;


  const calculateSelectedTotalPrice = () => {
    return cartItems
      .filter(item => selectedCartItems.includes(item.id))
      .reduce((total, item) => total + (item.productPrice * item.quantity), 0)
      .toFixed(2);
  };

  const handleCheckoutSelected = () => {
    console.log('handleCheckoutSelected: Запущена проверка оформления заказа.');
    const itemsToCheckout = cartItems.filter(item => selectedCartItems.includes(item.id));
    
    if (itemsToCheckout.length === 0) {
      alert('Пожалуйста, выберите хотя бы один товар для оформления заказа.');
      return;
    }

    // НОВОЕ: Проверка наличия товара на складе для выбранных позиций
    // Убедимся, что stockQuantity является числом для корректного сравнения
    const unavailableItems = itemsToCheckout.filter(item => {
      const isUnavailable = item.quantity > (item.stockQuantity || 0) || (item.stockQuantity || 0) === 0;
      console.log(`Проверка товара: ${item.productName} (В корзине: ${item.quantity}, На складе: ${item.stockQuantity || 'N/A'}) - Недоступен: ${isUnavailable}`);
      return isUnavailable;
    });

    if (unavailableItems.length > 0) {
      const unavailableNames = unavailableItems.map(item => `${item.productName} (${item.designName})`).join(', ');
      alert(`Следующие товары недоступны или их количество в корзине превышает остаток на складе: ${unavailableNames}. Пожалуйста, скорректируйте количество или удалите их.`);
      return;
    }
    console.log('handleCheckoutSelected: Все выбранные товары доступны, переходим к оформлению.');
    navigate('/checkout', { state: { selectedItems: itemsToCheckout } });
  };

  if (loading) {
    return <div className="text-center text-gray-600">Загрузка корзины...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!isLoggedIn) {
    return <div className="text-center text-gray-600">Пожалуйста, войдите, чтобы просмотреть и управлять вашей корзиной.</div>;
  }

  if (cartItems.length === 0) {
    return <div className="text-center text-gray-600">Ваша корзина пуста.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Ваша Корзина</h2>
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center mb-4 border-b pb-3">
          <input
            type="checkbox"
            id="selectAll"
            className="mr-2 h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
            checked={isAllSelected}
            onChange={handleSelectAllChange}
            disabled={availableItems.length === 0} // Отключаем, если нет доступных товаров
          />
          <label htmlFor="selectAll" className="text-lg font-semibold text-gray-700">Выбрать все</label>
        </div>

        {cartItems.map(item => {
          // ИСПРАВЛЕНО: Приоритет PrimaryImageUrl, затем DesignImageUrl
          const imageUrlToDisplay = item.primaryImageUrl || item.designImageUrl;
          console.log('Cart Item Data:', item); // <<< ВАЖНО: Проверьте это в консоли
          return (
            <div key={item.id} className="flex items-center justify-between border-b border-gray-200 py-4 last:border-b-0">
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
                  checked={selectedCartItems.includes(item.id)}
                  onChange={() => handleCheckboxChange(item.id)}
                  // НОВОЕ: Отключаем чекбокс, если товара нет в наличии или количество в корзине превышает остаток
                  disabled={item.stockQuantity === 0 || item.quantity > item.stockQuantity}
                />
                {/* ИСПРАВЛЕНО: Используем imageUrlToDisplay */}
                <img
                  src={imageUrlToDisplay || 'https://placehold.co/80x80/e0e0e0/ffffff?text=Нет+изображения'}
                  alt={item.productName}
                  className="w-20 h-20 object-cover rounded-md"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/80x80/e0e0e0/ffffff?text=Нет+изображения'; }}
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{item.productName}</h3>
                  <p className="text-gray-600 text-sm">{item.designName} ({item.baseColorName})</p>
                  <p className="text-gray-700 font-medium">{item.productPrice.toFixed(2)} ₽</p>
                  {/* НОВОЕ: Отображение количества на складе */}
                  <p className={`text-sm font-semibold mt-1 ${item.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    На складе: {item.stockQuantity} шт.
                  </p>
                  {/* НОВОЕ: Предупреждение, если количество в корзине больше, чем на складе */}
                  {item.quantity > item.stockQuantity && item.stockQuantity > 0 && (
                    <p className="text-red-500 text-xs mt-1">В корзине больше, чем на складе!</p>
                  )}
                  {item.stockQuantity === 0 && (
                    <p className="text-red-500 text-xs mt-1">Нет в наличии!</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-l-md"
                    disabled={item.quantity <= 1} // Отключаем минус, если количество 1
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-3 text-lg font-medium">{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-r-md"
                    disabled={item.quantity >= item.stockQuantity} // Отключаем плюс, если достигнут лимит склада
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 text-red-500 hover:bg-red-100 rounded-md"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          );
        })}
        <div className="flex justify-between items-center mt-6">
          <p className="text-xl font-bold text-gray-800">Итого выбранных: {calculateSelectedTotalPrice()} ₽</p>
          <button
            onClick={handleCheckoutSelected}
            className="ml-4 bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={selectedCartItems.length === 0}
          >
            Оформить выбранные товары
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartPage;
