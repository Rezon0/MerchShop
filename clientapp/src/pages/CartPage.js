// src/pages/CartPage.js
import React, { useContext, useEffect, useState } from 'react';
import { CartContext, AuthContext } from '../App'; // Убедитесь, что путь к App.js корректен
import { Trash2, Plus, Minus } from 'lucide-react'; // Импорт иконок
import { useNavigate } from 'react-router-dom'; // Импорт useNavigate

function CartPage({ API_BASE_URL }) {
  const { cartItems, removeFromCart, updateCartItemQuantity, fetchCartItems } = useContext(CartContext);
  const { isLoggedIn } = useContext(AuthContext); // Получаем isLoggedIn из AuthContext
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Инициализация useNavigate

  useEffect(() => {
    console.log('CartPage useEffect: isLoggedIn state:', isLoggedIn); // Логируем состояние isLoggedIn
    const loadCart = async () => {
      setLoading(true);
      setError(null);
      if (isLoggedIn) { // Загружаем корзину только если пользователь авторизован
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
        // Эта строка была причиной ESLint ошибки и не нужна,
        // так как fetchCartItems в App.js уже управляет состоянием cartItems
        // setCartItems([]);
        setError('Пожалуйста, войдите, чтобы просмотреть и управлять вашей корзиной.');
      }
    };
    loadCart();
  }, [fetchCartItems, isLoggedIn]); // Зависимость от fetchCartItems и isLoggedIn

  const handleQuantityChange = async (cartItemId, currentQuantity, delta) => {
    const newQuantity = currentQuantity + delta;
    if (newQuantity >= 0) { // Позволяем уменьшать до 0 для удаления
      await updateCartItemQuantity(cartItemId, newQuantity);
    }
  };

  const calculateTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.productPrice * item.quantity), 0).toFixed(2);
  };

  if (loading) {
    return <div className="text-center text-gray-600">Загрузка корзины...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!isLoggedIn) { // Дополнительная проверка на isLoggedIn для отображения сообщения
    return <div className="text-center text-gray-600">Пожалуйста, войдите, чтобы просмотреть и управлять вашей корзиной.</div>;
  }

  if (cartItems.length === 0) {
    return <div className="text-center text-gray-600">Ваша корзина пуста.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Ваша Корзина</h2>
      <div className="bg-white shadow-lg rounded-lg p-6">
        {cartItems.map(item => (
          <div key={item.id} className="flex items-center justify-between border-b border-gray-200 py-4 last:border-b-0">
            <div className="flex items-center space-x-4">
              {/* Отображение изображения товара, если оно есть */}
              {item.primaryImageUrl && (
                <img
                  src={item.primaryImageUrl}
                  alt={item.productName}
                  className="w-20 h-20 object-cover rounded-md"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/80x80/e0e0e0/ffffff?text=No+Image'; }}
                />
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{item.productName}</h3>
                <p className="text-gray-600 text-sm">{item.designName} ({item.baseColorName})</p>
                <p className="text-gray-700 font-medium">{item.productPrice.toFixed(2)} ₽</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center border border-gray-300 rounded-md">
                <button
                  onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-l-md"
                >
                  <Minus size={16} />
                </button>
                <span className="px-3 text-lg font-medium">{item.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-r-md"
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
        ))}
        <div className="flex justify-end items-center mt-6">
          <p className="text-xl font-bold text-gray-800">Итого: {calculateTotalPrice()} ₽</p>
          <button className="ml-4 bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 transition duration-300">
            Оформить заказ
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartPage;
