import React, { useState, useEffect } from 'react';
import './App.css'; // Убедитесь, что этот файл существует

// Импорт компонентов
import Header from './components/Header';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';

// Импорт страниц
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';       // Новая страница входа
import RegisterPage from './pages/RegisterPage'; // Новая страница регистрации

// Импорт пользовательских хуков
import useDebounce from './hooks/useDebounce';

const App = () => {
    // Состояние для фактических данных о продуктах из API
    const [apiProducts, setApiProducts] = useState([]);
    const [apiLoading, setApiLoading] = useState(true);
    const [apiError, setApiError] = useState(null);

    // Состояние для текущей страницы (для имитации маршрутизации)
    const [currentPage, setCurrentPage] = useState('products');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [showAuthModal, setShowAuthModal] = useState(false);

    // useEffect для получения данных из API при монтировании компонента App
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
    }, []); // Пустой массив зависимостей: эффект запускается один раз при монтировании

    // Функция для навигации между страницами
    const navigateTo = (page, product = null) => {
        setCurrentPage(page);
        setSelectedProduct(product);
        setShowAuthModal(false); // Закрываем модальное окно при навигации
    };

    // Обработчик клика по кнопке "Профиль"
    const handleProfileClick = () => {
        setShowAuthModal(true);
    };

    // Функции для корзины
    const addToCart = (product) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.product.id === product.id);
            if (existingItem) {
                return prevItems.map(item =>
                    item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                return [...prevItems, { product: product, quantity: 1 }];
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

    // Функция для рендеринга текущей страницы
    const renderPage = () => {
        // Отображение состояния загрузки или ошибки API
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

        // Переключение между страницами
        switch (currentPage) {
            case 'home':
                return <HomePage navigateTo={navigateTo} />;
            case 'products':
                return <ProductsPage
                            navigateTo={navigateTo}
                            addToCart={addToCart}
                            products={apiProducts}
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
            case 'login': // Новая страница входа
                return <LoginPage navigateTo={navigateTo} />;
            case 'register': // Новая страница регистрации
                return <RegisterPage navigateTo={navigateTo} />;
            default:
                return <ProductsPage // По умолчанию отображаем товары
                            navigateTo={navigateTo}
                            addToCart={addToCart}
                            products={apiProducts}
                            searchTerm={debouncedSearchTerm}
                        />;
        }
    };

    return (
        <div className="min-h-screen flex flex-col font-sans bg-gray-50">
            {/* Глобальные CSS анимации - оставляем их здесь для простоты, можно переместить в App.css */}
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

            {/* Модальное окно авторизации/регистрации */}
            <AuthModal show={showAuthModal} onClose={() => setShowAuthModal(false)} navigateTo={navigateTo} />
        </div>
    );
};

export default App;