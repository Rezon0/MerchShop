import React from 'react';

const Header = ({ currentPage, navigateTo, cartItems, searchTerm, setSearchTerm, onProfileClick }) => (
    <header className="bg-gray-800 text-white p-4 shadow-md rounded-b-lg">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <h1 className="text-3xl font-bold text-indigo-300">
                Merch Shop
            </h1>
            {/* Search field */}
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
                        <button
                            onClick={() => navigateTo('products')}
                            className={`px-3 py-2 rounded-lg transition-colors duration-200
                                ${currentPage === 'products' ? 'bg-indigo-700 text-white' : 'hover:bg-gray-700'}
                                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50`}
                        >
                            Товары
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => navigateTo('cart')}
                            className={`px-3 py-2 rounded-lg transition-colors duration-200 relative
                                ${currentPage === 'cart' ? 'bg-indigo-700 text-white' : 'hover:bg-gray-700'}
                                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50`}
                        >
                            Корзина ({cartItems.reduce((total, item) => total + item.quantity, 0)})
                            {cartItems.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                    {cartItems.reduce((total, item) => total + item.quantity, 0)}
                                </span>
                            )}
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={onProfileClick}
                            className={`px-3 py-2 rounded-lg transition-colors duration-200
                                ${currentPage === 'home' ? 'bg-indigo-700 text-white' : 'hover:bg-gray-700'}
                                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50`}
                        >
                            Профиль
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    </header>
);

export default Header;