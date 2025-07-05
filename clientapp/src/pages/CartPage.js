import React from 'react';

const CartPage = ({ cartItems, navigateTo, removeFromCart, updateQuantity }) => {
    const total = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    return (
        <section className="py-8 px-4 bg-gray-100 min-h-screen">
            <div className="container mx-auto">
                <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center">Ваша Корзина</h2>
                {cartItems.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                        <p className="text-gray-600 text-lg">Ваша корзина в настоящее время пуста.</p>
                        <button
                            onClick={() => navigateTo('products')}
                            className="mt-6 bg-indigo-600 text-white font-bold py-2 px-6 rounded-full hover:bg-indigo-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                        >
                            Вернуться к Покупкам
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="divide-y divide-gray-200">
                            {cartItems.map(item => {
                                const imageUrl = item.product.productDesigns &&
                                                 Array.isArray(item.product.productDesigns.$values) &&
                                                 item.product.productDesigns.$values.length > 0 &&
                                                 item.product.productDesigns.$values[0].design?.imageUrl
                                    ? item.product.productDesigns.$values[0].design.imageUrl
                                    : item.product.primaryImageUrl || 'https://placehold.co/80x80/6b7280/ffffff?text=Img';

                                return (
                                    <div key={item.product.id} className="flex items-center py-4">
                                        <img
                                            src={imageUrl}
                                            alt={item.product.name}
                                            className="w-20 h-20 object-cover rounded-md mr-4 shadow-sm"
                                            onError={(e) => {
                                                console.error(`Ошибка загрузки изображения в корзине для ${item.product.name}: ${e.target.src}`);
                                                e.target.onerror = null;
                                                e.target.src = 'https://placehold.co/80x80/6b7280/ffffff?text=Img';
                                            }}
                                        />
                                        <div className="flex-grow">
                                            <h3 className="text-lg font-semibold text-gray-900">{item.product.name}</h3>
                                            <p className="text-gray-600">${item.product.price.toFixed(2)} за шт.</p>
                                        </div>
                                        <div className="flex items-center">
                                            <button
                                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                className="bg-gray-200 text-gray-700 px-3 py-1 rounded-l-md hover:bg-gray-300 transition-colors duration-200"
                                            >
                                                -
                                            </button>
                                            <span className="bg-gray-100 text-gray-800 px-4 py-1 border-y border-gray-300">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                className="bg-gray-200 text-gray-700 px-3 py-1 rounded-r-md hover:bg-gray-300 transition-colors duration-200"
                                            >
                                                +
                                            </button>
                                            <button
                                                onClick={() => removeFromCart(item.product.id)}
                                                className="ml-4 bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors duration-200 text-sm"
                                            >
                                                Удалить
                                            </button>
                                        </div>
                                        <span className="ml-8 text-xl font-bold text-indigo-700">
                                            ${(item.product.price * item.quantity).toFixed(2)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-8 pt-4 border-t-2 border-gray-200 flex justify-end items-center">
                            <span className="text-2xl font-bold text-gray-800 mr-4">Итого:</span>
                            <span className="text-3xl font-extrabold text-indigo-800">${total.toFixed(2)}</span>
                        </div>
                        <div className="mt-6 text-right">
                            <button className="bg-green-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-green-700 transform hover:scale-105 transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-70 text-lg">
                                Оформить Заказ
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default CartPage;