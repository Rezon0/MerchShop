// src/App.js
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom'; // Импортируем Routes, Route и useNavigate
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
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Импорт пользовательских хуков
import useDebounce from './hooks/useDebounce';

const App = () => {
    // Состояние для фактических данных о продуктах из API
    const [apiProducts, setApiProducts] = useState([]);
    const [apiLoading, setApiLoading] = useState(true);
    const [apiError, setApiError] = useState(null);

    // Состояние для корзины
    const [cartItems, setCartItems] = useState([]);

    // Состояние для поиска
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // Состояние для модального окна авторизации
    const [showAuthModal, setShowAuthModal] = useState(false);

    // useNavigate из react-router-dom для программной навигации
    const navigate = useNavigate();

    // useEffect для получения данных из API при монтировании компонента App
    useEffect(() => {
        const fetchProducts = async () => {
            setApiLoading(true);
            setApiError(null);

            try {
                // Убедитесь, что порт вашего API правильный (7041 или 7232 или другой)
                const response = await fetch('https://localhost:7232/api/Products'); // <-- Проверьте этот порт!
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                // Десериализация $values из ответа ASP.NET Core
                setApiProducts(Array.isArray(data.$values) ? data.$values : data);
            } catch (err) {
                console.error("Error fetching products from API:", err);
                setApiError("Не удалось загрузить товары из API. Пожалуйста, попробуйте позже.");
            } finally {
                setApiLoading(false);
            }
        };

        fetchProducts();
    }, []); // Пустой массив зависимостей: эффект запускается один раз при монтировании

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
        alert(`${product.name} добавлен в корзину!`); // Consider replacing alert with a custom modal/toast
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

    // Обработчик клика по кнопке "Профиль"
    const handleProfileClick = () => {
        console.log('App.js: handleProfileClick вызвана!'); // DEBUG LOG
        setShowAuthModal(true);
    };

    // Функции для управления модальным окном
    const closeAuthModal = () => {
        console.log('App.js: closeAuthModal вызвана!'); // DEBUG LOG
        setShowAuthModal(false);
    };

    // DEBUG LOG: Отслеживаем изменение showAuthModal
    useEffect(() => {
        console.log('App.js: showAuthModal изменилось на:', showAuthModal);
    }, [showAuthModal]);


    // Отображение состояния загрузки или ошибки API
    if (apiLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-xl">Загрузка товаров из API...</p>
                </div>
            </div>
        );
    }

    if (apiError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md shadow-md">
                    <p className="text-lg font-semibold">{apiError}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 bg-red-600 text-white font-bold py-2 px-6 rounded-full hover:bg-red-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                    >
                        Повторить
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col font-sans bg-gray-50">
            {/* Глобальные CSS анимации */}
            <style>
                {`
                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-scaleIn { animation: scaleIn 0.3s ease-out forwards; }

                @keyframes fadeInDown {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeInDown { animation: fadeInDown 0.6s ease-out forwards; }
                `}
            </style>

            <Header
                navigateTo={navigate} // Передаем navigate из react-router-dom
                cartItems={cartItems}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onProfileClick={handleProfileClick}
                showAuthModal={showAuthModal} // Передаем состояние showAuthModal
            />

            <main className="flex-grow p-4">
                {/* Здесь определяются маршруты с помощью Routes и Route */}
                <Routes>
                    {/* Главная страница теперь ProductsPage */}
                    <Route
                        path="/"
                        element={
                            <ProductsPage
                                navigateTo={navigate}
                                addToCart={addToCart}
                                products={apiProducts}
                                searchTerm={debouncedSearchTerm}
                            />
                        }
                    />

                    {/* ProductsPage - основной список товаров, также доступен по /products */}
                    <Route
                        path="/products"
                        element={
                            <ProductsPage
                                navigateTo={navigate}
                                addToCart={addToCart}
                                products={apiProducts}
                                searchTerm={debouncedSearchTerm}
                            />
                        }
                    />
                    {/* ProductDetailPage - детали одного товара, используем параметр URL :id */}
                    <Route
                        path="/products/:id"
                        element={
                            <ProductDetailPage
                                navigateTo={navigate}
                                addToCart={addToCart}
                                products={apiProducts} // Продукты для поиска конкретного по ID
                            />
                        }
                    />
                    {/* CartPage - страница корзины */}
                    <Route
                        path="/cart"
                        element={
                            <CartPage
                                cartItems={cartItems}
                                navigateTo={navigate}
                                removeFromCart={removeFromCart}
                                updateQuantity={updateQuantity}
                            />
                        }
                    />
                    {/* LoginPage - страница входа */}
                    <Route path="/login" element={<LoginPage navigateTo={navigate} />} />
                    {/* RegisterPage - страница регистрации */}
                    <Route path="/register" element={<RegisterPage navigateTo={navigate} />} />

                    {/* HomePage - если вы хотите сохранить ее как отдельную страницу, например, для информации о компании */}
                    <Route path="/home" element={<HomePage navigateTo={navigate} />} />

                    {/* Если URL не соответствует ни одному маршруту, можно добавить 404 страницу */}
                    <Route path="*" element={<h2>404: Страница не найдена</h2>} />
                </Routes>
            </main>

            <Footer />

            {/* Модальное окно авторизации/регистрации */}
            {/* Добавляем key для принудительного перемонтирования компонента при изменении showAuthModal */}
            {showAuthModal && <AuthModal key="auth-modal-instance" show={showAuthModal} onClose={closeAuthModal} navigateTo={navigate} />}
        </div>
    );
};

export default App;
