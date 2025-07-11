// src/pages/OrderHistoryPage.js
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../App'; // Убедитесь, что путь к App.js корректен

function OrderHistoryPage({ API_BASE_URL }) {
  const { isLoggedIn, handleLogout } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isLoggedIn) {
        setLoading(false);
        setError('Вы не авторизованы для просмотра истории заказов.');
        return;
      }

      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        setError('Токен авторизации отсутствует.');
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/Orders`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            handleLogout(); // Токен недействителен, выходим
            throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
          }
          throw new Error(`Ошибка загрузки истории заказов: ${response.statusText}`);
        }

        const data = await response.json();
        setOrders(data);
      } catch (err) {
        console.error('Error fetching order history:', err);
        setError(err.message || 'Не удалось загрузить историю заказов.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isLoggedIn, API_BASE_URL, handleLogout]);

  if (loading) {
    return <div className="text-center text-gray-600">Загрузка истории заказов...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (orders.length === 0) {
    return <div className="text-center text-gray-600">У вас пока нет заказов.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">История Заказов</h2>
      {orders.map(order => (
        <div key={order.id} className="bg-white shadow-lg rounded-lg p-6 mb-4">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h3 className="text-xl font-semibold text-gray-800">Заказ #{order.id}</h3>
            <p className="text-gray-600">Дата: {new Date(order.creationDateTime).toLocaleDateString()}</p> {/* ИСПРАВЛЕНО: orderDate на creationDateTime */}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {order.items.map(item => { // ИСПРАВЛЕНО: orderItems на items
              // ИСПРАВЛЕНО: Приоритет PrimaryImageUrl, затем DesignImageUrl
              const imageUrlToDisplay = item.primaryImageUrl || item.designImageUrl;
              return (
                <div key={item.productDesignId} className="flex items-center space-x-4 bg-gray-50 p-3 rounded-md"> {/* ИСПРАВЛЕНО: key на productDesignId */}
                  <img
                    src={imageUrlToDisplay || 'https://placehold.co/60x60/e0e0e0/ffffff?text=Нет+изображения'} // ИСПРАВЛЕНО: Используем imageUrlToDisplay
                    alt={item.productName}
                    className="w-16 h-16 object-cover rounded-md"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/60x60/e0e0e0/ffffff?text=Нет+изображения'; }}
                  />
                  <div>
                    <p className="font-medium text-gray-800">{item.productName}</p>
                    <p className="text-sm text-gray-600">{item.designName} ({item.baseColorName})</p>
                    <p className="text-sm text-gray-700">{item.quantity} шт. x {item.priceAtOrder.toFixed(2)} ₽</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-right mt-4 pt-2 border-t">
            <p className="text-lg font-bold text-gray-800">Итого по заказу: {order.totalAmount.toFixed(2)} ₽</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default OrderHistoryPage;
