import React, { useState, useEffect } from 'react';
import './App.css'; // Make sure this import is present and App.css exists

// ==========================================================
// Custom Hooks (Helper Hooks)
// ==========================================================

// Debounce hook: delays value update for a specified time
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

// ==========================================================
// Components
// ==========================================================

// Header and navigation component
const Header = ({ currentPage, navigateTo, cartItems, searchTerm, setSearchTerm, onProfileClick }) => (
    <header className="bg-gray-800 text-white p-4 shadow-md rounded-b-lg">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <h1 className="text-3xl font-bold text-indigo-300">
                Придумай название
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

// Home page component
const HomePage = ({ navigateTo }) => (
    <section className="py-16 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg shadow-xl text-center m-4">
        <div className="container mx-auto px-6">
            <h2 className="text-6xl font-extrabold mb-6 animate-fadeInDown">
                Ваш Профиль
            </h2>
            <p className="text-2xl leading-relaxed mb-10 animate-fadeIn">
                Здесь вы можете управлять своей информацией, просматривать историю заказов и настраивать предпочтения.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <button
                    onClick={() => alert('Функционал пока не реализован!')}
                    className="bg-white text-teal-800 font-bold py-4 px-10 rounded-full shadow-lg hover:bg-gray-100 transform hover:scale-105 transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-70 text-xl"
                >
                    История Заказов
                </button>
                <button
                    onClick={() => alert('Функционал пока не реализован!')}
                    className="bg-teal-800 text-white font-bold py-4 px-10 rounded-full shadow-lg border-2 border-white hover:bg-teal-900 transform hover:scale-105 transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-70 text-xl"
                >
                    Настройки Аккаунта
                </button>
            </div>
            <p className="mt-8 text-lg opacity-90">
                С возвращением! Мы рады вас видеть.
            </p>
        </div>
    </section>
);


// Products page component (UPDATED FOR REAL DATA AND DEBUGGING)
const ProductsPage = ({ navigateTo, addToCart, products, searchTerm }) => {
    const filteredProducts = Array.isArray(products) ? products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    return (
        <section className="py-8 px-4 bg-gray-100 min-h-screen">
            <div className="container mx-auto">
                <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center">Наши Продукты</h2>
                {filteredProducts.length === 0 && searchTerm !== '' ? (
                    <p className="text-center text-gray-600 text-xl">
                        Продукты не найдены по запросу "{searchTerm}".
                    </p>
                ) : filteredProducts.length === 0 && searchTerm === '' ? (
                    <p className="text-center text-gray-600 text-xl">
                        Пока нет продуктов для отображения. Добавьте их в базу данных!
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredProducts.map((product) => {
                            // Determine the image URL: prioritize productDesigns, then primaryImageUrl, then a fallback placeholder
                            const imageUrl = product.productDesigns &&
                 Array.isArray(product.productDesigns.$values) &&
                 product.productDesigns.$values.length > 0 &&
                 product.productDesigns.$values[0].design?.imageUrl
    ? product.productDesigns.$values[0].design.imageUrl
    : product.primaryImageUrl || 'https://placehold.co/400x300/6b7280/ffffff?text=Изображение+не+найдено';

                            // --- ADDED LOG FOR DEBUGGING ---
                            console.log(`Продукт: ${product.name}, Используемый URL изображения: ${imageUrl}`);
                            // -----------------------------

                            return (
                                <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition duration-300 ease-in-out flex flex-col">
                                    <button onClick={() => navigateTo('productDetail', product)} className="block w-full h-48 focus:outline-none">
                                        <img
                                            src={imageUrl}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                console.error(`Ошибка загрузки изображения для ${product.name}: ${e.target.src}`);
                                                e.target.onerror = null; // Prevent infinite loop
                                                e.target.src = 'https://placehold.co/400x300/6b7280/ffffff?text=Изображение+не+найдено';
                                            }}
                                        />
                                    </button>
                                    <div className="p-6 flex flex-col flex-grow">
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
                                        <p className="text-gray-600 text-sm mb-4 flex-grow">{product.description}</p>
                                        <div className="flex justify-between items-center mt-auto">
                                            <span className="text-2xl font-bold text-indigo-600">${product.price.toFixed(2)}</span>
                                            <button
                                                onClick={() => addToCart(product)}
                                                className="bg-indigo-600 text-white px-5 py-2 rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-colors duration-200 text-sm"
                                            >
                                                Добавить в Корзину
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
};

// Product detail page component (UPDATED FOR DEBUGGING)
const ProductDetailPage = ({ selectedProduct, navigateTo, addToCart }) => {
    if (!selectedProduct) {
        return (
            <section className="py-8 px-4 bg-gray-100 min-h-screen flex items-center justify-center">
                <p className="text-gray-600 text-xl">Продукт не найден.</p>
            </section>
        );
    }

    const imageUrl = selectedProduct.productDesigns &&
                 Array.isArray(selectedProduct.productDesigns.$values) &&
                 selectedProduct.productDesigns.$values.length > 0 &&
                 selectedProduct.productDesigns.$values[0].design?.imageUrl
    ? selectedProduct.productDesigns.$values[0].design.imageUrl
    : selectedProduct.primaryImageUrl || 'https://placehold.co/600x450/6b7280/ffffff?text=Изображение+не+найдено';

    // --- ADDED LOG FOR DEBUGGING ---
    console.log(`Детали Продукта: ${selectedProduct.name}, Используемый URL изображения: ${imageUrl}`);
    // -----------------------------

    return (
        <section className="py-12 px-4 bg-gray-100 min-h-screen">
            <div className="container mx-auto bg-white rounded-xl shadow-lg p-8 md:p-12">
                <button
                    onClick={() => navigateTo('products')}
                    className="text-indigo-600 hover:text-indigo-800 flex items-center mb-6 text-lg transition-colors duration-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Вернуться к Продуктам
                </button>

                <div className="flex flex-col md:flex-row gap-8">
                    <div className="md:w-1/2">
                        <img
                            src={imageUrl}
                            alt={selectedProduct.name}
                            className="w-full h-auto rounded-lg shadow-md max-h-96 object-contain"
                            onError={(e) => {
                                console.error(`Ошибка загрузки детального изображения для ${selectedProduct.name}: ${e.target.src}`);
                                e.target.onerror = null;
                                e.target.src = 'https://placehold.co/600x450/6b7280/ffffff?text=Изображение+не+найдено';
                            }}
                        />
                    </div>
                    <div className="md:w-1/2 flex flex-col justify-center">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">{selectedProduct.name}</h2>
                        <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                            {selectedProduct.description} {/* Use description from API */}
                        </p>
                        <div className="flex items-center mb-6">
                            <span className="text-4xl font-extrabold text-indigo-700 mr-4">${selectedProduct.price.toFixed(2)}</span>
                            {/* Removed strikethrough price as it's not in the Product model */}
                        </div>
                        <button
                            onClick={() => addToCart(selectedProduct)}
                            className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-indigo-700 transform hover:scale-105 transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-70 text-lg"
                        >
                            Добавить в Корзину
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

// Cart page component
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
                                // Определяем URL изображения для элемента корзины
                                const imageUrl = item.product.productDesigns &&
                                                 Array.isArray(item.product.productDesigns.$values) &&
                                                 item.product.productDesigns.$values.length > 0 &&
                                                 item.product.productDesigns.$values[0].design?.imageUrl
                                    ? item.product.productDesigns.$values[0].design.imageUrl
                                    : item.product.primaryImageUrl || 'https://placehold.co/80x80/6b7280/ffffff?text=Img';

                                return (
                                    <div key={item.product.id} className="flex items-center py-4">
                                        <img
                                            src={imageUrl} // ИСПОЛЬЗУЕМ ОБНОВЛЕННЫЙ imageUrl
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

// Auth modal component
const AuthModal = ({ show, onClose }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full relative transform transition-all duration-300 scale-95 opacity-0 animate-scaleIn">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl font-bold focus:outline-none"
                    aria-label="Close"
                >
                    &times;
                </button>
                <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    Вход или Регистрация
                </h3>
                <p className="text-gray-600 text-center mb-8">
                    Чтобы получить доступ к функциям профиля, пожалуйста, войдите или создайте новую учетную запись.
                </p>
                <div className="flex flex-col space-y-4">
                    <button
                        onClick={() => alert('Форма входа будет здесь.')}
                        className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-full hover:bg-indigo-700 transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-70"
                    >
                        Войти
                    </button>
                    <button
                        onClick={() => alert('Форма регистрации будет здесь.')}
                        className="bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-full hover:bg-gray-300 transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-gray-400 focus:ring-opacity-70"
                    >
                        Зарегистрироваться
                    </button>
                </div>
            </div>
        </div>
    );
};

// Footer component
const Footer = () => (
    <footer className="bg-gray-800 text-white p-4 mt-8 shadow-inner rounded-t-lg">
        <div className="container mx-auto text-center text-sm">
            &copy; {new Date().getFullYear()} Merch Shop. Все права защищены.
        </div>
    </footer>
);

// ==========================================================
// Main App Component
// ==========================================================
const App = () => {
    // State for actual product data from API
    const [apiProducts, setApiProducts] = useState([]);
    const [apiLoading, setApiLoading] = useState(true);
    const [apiError, setApiError] = useState(null);

    const [currentPage, setCurrentPage] = useState('products');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [showAuthModal, setShowAuthModal] = useState(false);

    // useEffect to fetch data from API when App component mounts
    useEffect(() => {
        const fetchProducts = async () => {
            setApiLoading(true);
            setApiError(null);

            try {
                const response = await fetch('https://localhost:7232/api/Products');
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                setApiProducts(Array.isArray(data.$values) ? data.$values : []);
            } catch (err) {
                console.error("Error fetching products from API:", err);
                setApiError("Не удалось загрузить товары из API. Пожалуйста, попробуйте позже.");
            } finally {
                setApiLoading(false);
            }
        };

        fetchProducts();
    }, []); // Empty dependency array: effect runs once on mount

    const navigateTo = (page, product = null) => {
        setCurrentPage(page);
        setSelectedProduct(product);
        setShowAuthModal(false);
    };

    const handleProfileClick = () => {
        setShowAuthModal(true);
    };

    const addToCart = (product) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === product.id);
            if (existingItem) {
                return prevItems.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                return [...prevItems, { product: product, quantity: 1 }]; // Store product object inside cart item
            }
        });
        alert(`${product.name} добавлен в корзину!`);
    };

    const removeFromCart = (productId) => {
        setCartItems(prevItems => prevItems.filter(item => item.product.id !== productId));
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.product.id === productId ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    const renderPage = () => {
        // If API is loading or an error occurred, display appropriate state
        if (apiLoading) {
            return (
                <section className="py-8 px-4 bg-gray-100 min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                        <p className="text-gray-600 text-xl">Загрузка товаров из API...</p>
                    </div>
                </section>
            );
        }

        if (apiError) {
            return (
                <section className="py-8 px-4 bg-gray-100 min-h-screen flex items-center justify-center">
                    <div className="text-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md shadow-md">
                        <p className="text-lg font-semibold">{apiError}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 bg-red-600 text-white font-bold py-2 px-6 rounded-full hover:bg-red-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                        >
                            Повторить
                        </button>
                    </div>
                </section>
            );
        }

        switch (currentPage) {
            case 'home':
                return <HomePage navigateTo={navigateTo} />;
            case 'products':
                return <ProductsPage
                            navigateTo={navigateTo}
                            addToCart={addToCart}
                            products={apiProducts} // Pass actual API data
                            searchTerm={debouncedSearchTerm}
                        />;
            case 'productDetail':
                return <ProductDetailPage
                            selectedProduct={selectedProduct}
                            navigateTo={navigateTo}
                            addToCart={addToCart}
                        />;
            case 'cart':
                return <CartPage
                            cartItems={cartItems}
                            navigateTo={navigateTo}
                            removeFromCart={removeFromCart}
                            updateQuantity={updateQuantity}
                        />;
            default:
                return <ProductsPage // Default to displaying products from API
                            navigateTo={navigateTo}
                            addToCart={addToCart}
                            products={apiProducts}
                            searchTerm={debouncedSearchTerm}
                        />;
        }
    };

    return (
        <div className="min-h-screen flex flex-col font-sans bg-gray-50">
            {/* Global CSS animations for smooth modal appearance and other elements */}
            <style>
                {`
                @keyframes scaleIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                .animate-scaleIn {
                    animation: scaleIn 0.3s ease-out forwards;
                }

                @keyframes fadeInDown {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fadeInDown {
                    animation: fadeInDown 0.6s ease-out forwards;
                }
                `}
            </style>
            <Header
                currentPage={currentPage}
                navigateTo={navigateTo}
                cartItems={cartItems}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onProfileClick={handleProfileClick}
            />
            <main className="flex-grow p-4">
                {renderPage()}
            </main>
            <Footer />

            {/* Auth/Registration Modal */}
            <AuthModal show={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </div>
    );
};

export default App;
