// src/pages/CheckoutPage.js
import React, { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CartContext, AuthContext } from '../App';
import axios from 'axios';

function CheckoutPage({ API_BASE_URL }) {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { fetchCartItems } = useContext(CartContext);
  const { isLoggedIn } = useContext(AuthContext);

  const [selectedItems, setSelectedItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('PaymentOnDelivery'); // По умолчанию: Оплата при получении
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login'); // Перенаправить на страницу входа, если не авторизован
      return;
    }
    if (state && state.selectedItems) {
      setSelectedItems(state.selectedItems);
    } else {
      // Если нет выбранных товаров, перенаправить обратно в корзину
      navigate('/cart');
    }
  }, [state, navigate, isLoggedIn]);

  const calculateTotalPrice = () => {
    return selectedItems.reduce((total, item) => total + (item.productPrice * item.quantity), 0).toFixed(2);
  };

  const handleConfirmOrder = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setError('Вы не авторизованы. Пожалуйста, войдите.');
      setLoading(false);
      return;
    }

    try {
      const orderPayload = {
        cartItemIds: selectedItems.map(item => item.id),
        paymentMethod: paymentMethod // 'PaymentOnDelivery' или 'OnlinePayment'
      };

      console.log('Отправка заказа:', orderPayload);

      const response = await axios.post(`${API_BASE_URL}/Orders/place-order`, orderPayload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.status >= 200 && response.status < 300) {
        setSuccess('Заказ успешно оформлен!');
        // Обновить корзину после успешного оформления заказа
        await fetchCartItems();
        // Очистить выбранные товары на этой странице (визуально)
        setSelectedItems([]); 
        
        // УДАЛЕНО: Перенаправление на страницу истории заказов
        // setTimeout(() => {
        //   navigate('/orders'); 
        // }, 2000);
      } else {
        setError(response.data.message || 'Ошибка при оформлении заказа.');
      }
    } catch (err) {
      console.error('Ошибка при оформлении заказа:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Произошла ошибка при оформлении заказа. Пожалуйста, попробуйте позже.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return <div className="text-center text-red-500">Пожалуйста, войдите для оформления заказа.</div>;
  }

  if (selectedItems.length === 0) {
    return <div className="text-center text-gray-600">Нет выбранных товаров для оформления заказа.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Оформление Заказа</h2>
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Выбранные товары:</h3>
        <div className="space-y-4 mb-6">
          {selectedItems.map(item => (
            <div key={item.id} className="flex items-center space-x-4 border-b border-gray-200 pb-4 last:border-b-0">
              {item.primaryImageUrl && (
                <img
                  src={item.primaryImageUrl}
                  alt={item.productName}
                  className="w-16 h-16 object-cover rounded-md"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/64x64/e0e0e0/ffffff?text=No+Image'; }}
                />
              )}
              <div>
                <p className="font-semibold text-gray-800">{item.productName}</p>
                <p className="text-gray-600 text-sm">{item.designName} ({item.baseColorName})</p>
                <p className="text-gray-700">Количество: {item.quantity} | Цена: {(item.productPrice * item.quantity).toFixed(2)} ₽</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Способ оплаты:</h3>
          <div className="flex flex-col space-y-2">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio h-5 w-5 text-indigo-600"
                name="paymentMethod"
                value="PaymentOnDelivery"
                checked={paymentMethod === 'PaymentOnDelivery'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span className="ml-2 text-gray-700">Оплата при получении</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio h-5 w-5 text-indigo-600"
                name="paymentMethod"
                value="OnlinePayment"
                checked={paymentMethod === 'OnlinePayment'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span className="ml-2 text-gray-700">Оплата онлайн (заглушка)</span>
            </label>
          </div>
        </div>

        <div className="flex justify-between items-center mt-6">
          <p className="text-2xl font-bold text-gray-800">Итого к оплате: {calculateTotalPrice()} ₽</p>
          <button
            onClick={handleConfirmOrder}
            className="bg-indigo-600 text-white py-3 px-8 rounded-md hover:bg-indigo-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || selectedItems.length === 0}
          >
            {loading ? 'Оформление...' : 'Подтвердить Заказ'}
          </button>
        </div>

        {error && <div className="text-red-500 mt-4 text-center">{error}</div>}
        {success && <div className="text-green-500 mt-4 text-center">{success}</div>}
      </div>
    </div>
  );
}

export default CheckoutPage;
