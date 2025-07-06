// src/components/Header.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = ({ navigateTo, cartItems, searchTerm, setSearchTerm, onProfileClick, showAuthModal, isLoggedIn, currentUserName, onLogout }) => {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    return (
        <header className="bg-gray-800 text-white p-4 shadow-md rounded-b-lg">
            <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                <h1 className="text-3xl font-bold text-indigo-300">
                    Merch Shop
                </h1>
                <div className="flex-grow flex justify-center px-4 sm:px-0">
                    <input
                        type="text"
                        placeholder="Найти..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full max-w-md p-2 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-400
                                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    />
                </div>
                <nav>
                    <ul className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6 text-lg">
                        <li>
                            <Link
                                to="/products"
                                className={`px-3 py-2 rounded-lg transition-colors duration-200
                                    ${isActive('/products') || isActive('/') ? 'bg-indigo-700 text-white' : 'hover:bg-gray-700'}
                                    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50`}
                            >
                                Товары
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/cart"
                                className={`px-3 py-2 rounded-lg transition-colors duration-200 relative
                                    ${isActive('/cart') ? 'bg-indigo-700 text-white' : 'hover:bg-gray-700'}
                                    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50`}
                            >
                                Корзина ({cartItems.reduce((total, item) => total + item.quantity, 0)})
                                {cartItems.length > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                        {cartItems.reduce((total, item) => total + item.quantity, 0)}
                                    </span>
                                )}
                            </Link>
                        </li>
                        <li>
                            {isLoggedIn ? (
                                <div className="relative group">
                                    <button
                                        onClick={() => navigateTo('/profile')} // Переход на страницу профиля
                                        className={`px-3 py-2 rounded-lg transition-colors duration-200
                                            ${isActive('/profile') ? 'bg-indigo-700 text-white' : 'hover:bg-gray-700'}
                                            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50`}
                                    >
                                        Привет, {currentUserName}!
                                    </button>
                                    {/* Пример выпадающего меню для авторизованного пользователя */}
                                    <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg py-1 z-10 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 transition-all duration-200 ease-out">
                                        <button
                                            onClick={() => { navigateTo('/profile'); }}
                                            className="block px-4 py-2 text-sm text-white hover:bg-gray-600 w-full text-left"
                                        >
                                            Мой профиль
                                        </button>
                                        <button
                                            onClick={onLogout}
                                            className="block px-4 py-2 text-sm text-red-300 hover:bg-gray-600 w-full text-left"
                                        >
                                            Выйти
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={onProfileClick} // Открывает модальное окно для входа/регистрации
                                    className={`px-3 py-2 rounded-lg transition-colors duration-200
                                        ${showAuthModal || isActive('/login') || isActive('/register') ? 'bg-indigo-700 text-white' : 'hover:bg-gray-700'}
                                        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50`}
                                >
                                    Профиль
                                </button>
                            )}
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;