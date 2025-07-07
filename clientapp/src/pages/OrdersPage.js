// src/pages/OrdersPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://localhost:7232/api'; // Базовый URL для вашего API

const OrdersPage = ({ getAccessToken, userId }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        const token = getAccessToken();

        if (!token) {
            setError('Вы не авторизованы. Пожалуйста, войдите в систему.');
            setLoading(false);
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/Orders`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 401) {
                setError('Сессия истекла. Пожалуйста, войдите снова.');
                navigate('/login');
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            setOrders(Array.isArray(data.$values) ? data.$values : data);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError(`Не удалось загрузить заказы: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [getAccessToken, navigate]);

    useEffect(() => {
        if (userId) { // Загружаем заказы только если userId доступен
            fetchOrders();
        }
    }, [userId, fetchOrders]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-xl">Загрузка ваших заказов...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md shadow-md">
                    <p className="text-lg font-semibold">{error}</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="mt-4 bg-red-600 text-white font-bold py-2 px-6 rounded-full hover:bg-red-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                    >
                        Войти
                    </button>
                </div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="container mx-auto p-4 text-center bg-white shadow-lg rounded-lg">
                <h2 className="text-3xl font-bold mb-6 text-gray-800">Ваши заказы</h2>
                <p className="text-lg text-gray-600">У вас пока нет заказов.</p>
                <button
                    onClick={() => navigate('/products')}
                    className="mt-6 bg-indigo-600 text-white font-bold py-3 px-8 rounded-full hover:bg-indigo-700 transition duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                >
                    Начать покупки
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 bg-white shadow-lg rounded-lg">
            <h2 className="text-4xl font-extrabold text-center mb-8 text-gray-900">Ваши заказы</h2>

            <div className="space-y-8">
                {orders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-6 shadow-md bg-gray-50">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-bold text-gray-800">Заказ #{order.id}</h3>
                            <span className={`px-4 py-1 rounded-full text-sm font-semibold
                                ${order.statusName === 'В обработке' ? 'bg-yellow-100 text-yellow-800' :
                                  order.statusName === 'Выполнен' ? 'bg-green-100 text-green-800' :
                                  'bg-gray-100 text-gray-800'}`}>
                                Статус: {order.statusName}
                            </span>
                        </div>
                        <p className="text-gray-600 mb-2">Дата создания: {new Date(order.creationDateTime).toLocaleString()}</p>
                        {order.completionDateTime && (
                            <p className="text-gray-600 mb-2">Дата завершения: {new Date(order.completionDateTime).toLocaleString()}</p>
                        )}
                        <p className="text-gray-600 mb-4">Способ оплаты: {order.paymentMethodName}</p>

                        <div className="border-t border-gray-200 pt-4 mt-4">
                            <h4 className="text-xl font-semibold text-gray-700 mb-3">Товары в заказе:</h4>
                            {order.items.$values && order.items.$values.length > 0 ? (
                                order.items.$values.map((item, index) => (
                                    <div key={index} className="flex items-center mb-3 p-3 bg-white rounded-lg shadow-sm">
                                        <img
                                            src={item.primaryImageUrl || `https://placehold.co/80x80/E0E7FF/4338CA?text=${item.productName}`}
                                            alt={item.productName}
                                            className="w-20 h-20 object-cover rounded-lg mr-4"
                                        />
                                        <div className="flex-grow">
                                            <p className="text-lg font-medium text-gray-800">{item.productName}</p>
                                            <p className="text-gray-600 text-sm">Дизайн: {item.designName}</p>
                                            <p className="text-gray-600 text-sm">Цвет: {item.baseColorName}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-md text-gray-700">Количество: {item.quantity}</p>
                                            <p className="text-md font-bold text-indigo-600">${item.priceAtOrder.toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">Нет товаров в этом заказе.</p>
                            )}
                        </div>

                        <div className="border-t border-gray-200 pt-4 mt-4 flex justify-end">
                            <p className="text-2xl font-bold text-gray-900">
                                Общая сумма заказа: ${order.totalAmount.toFixed(2)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrdersPage;
