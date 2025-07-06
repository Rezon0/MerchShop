// src/App.js
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';

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
import UserProfilePage from './pages/UserProfilePage'; // НОВАЯ СТРАНИЦА: Профиль пользователя

// Импорт пользовательских хуков
import useDebounce from './hooks/useDebounce';

const App = () => {
    const [apiProducts, setApiProducts] = useState([]);
    const [apiLoading, setApiLoading] = useState(true);
    const [apiError, setApiError] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [showAuthModal, setShowAuthModal] = useState(false);

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [currentUserName, setCurrentUserName] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        const userId = localStorage.getItem('userId');
        const userName = localStorage.getItem('userName');

        if (token && userId && userName) {
            setIsLoggedIn(true);
            setCurrentUserId(userId);
            setCurrentUserName(userName);
        } else {
            setIsLoggedIn(false);
            setCurrentUserId(null);
            setCurrentUserName(null);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        setIsLoggedIn(false);
        setCurrentUserId(null);
        setCurrentUserName(null);
        navigate('/login');
    };

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
                setApiProducts(Array.isArray(data.$values) ? data.$values : data);
            } catch (err) {
                console.error("Error fetching products from API:", err);
                setApiError("Не удалось загрузить товары из API. Пожалуйста, попробуйте позже.");
            } finally {
                setApiLoading(false);
            }
        };

        fetchProducts();
    }, []);

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

    const handleProfileClick = () => {
        console.log('App.js: handleProfileClick вызвана!');
        setShowAuthModal(true);
    };

    const closeAuthModal = () => {
        console.log('App.js: closeAuthModal вызвана!');
        setShowAuthModal(false);
    };

    useEffect(() => {
        console.log('App.js: showAuthModal изменилось на:', showAuthModal);
    }, [showAuthModal]);

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

    // DEBUG LOG: Проверяем showAuthModal непосредственно перед рендером
    console.log('App.js: showAuthModal (перед рендером AuthModal):', showAuthModal);

    return (
        <div className="min-h-screen flex flex-col font-sans bg-gray-50">
            <style>
                {`
                @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                .animate-scaleIn { animation: scaleIn 0.3s ease-out forwards; }
                @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fadeInDown { animation: fadeInDown 0.6s ease-out forwards; }
                `}
            </style>

            <Header
                navigateTo={navigate}
                cartItems={cartItems}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onProfileClick={handleProfileClick}
                showAuthModal={showAuthModal}
                isLoggedIn={isLoggedIn}
                currentUserName={currentUserName}
                onLogout={handleLogout}
            />

            <main className="flex-grow p-4">
                <Routes>
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
                    <Route
                        path="/products/:id"
                        element={
                            <ProductDetailPage
                                navigateTo={navigate}
                                addToCart={addToCart}
                                products={apiProducts}
                            />
                        }
                    />
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
                    <Route path="/login" element={<LoginPage navigateTo={navigate} />} />
                    <Route path="/register" element={<RegisterPage navigateTo={navigate} />} />
                    <Route path="/home" element={<HomePage navigateTo={navigate} />} />

                    <Route
                        path="/profile"
                        element={
                            isLoggedIn ? (
                                <UserProfilePage userId={currentUserId} userName={currentUserName} onLogout={handleLogout} />
                            ) : (
                                <LoginPage navigateTo={navigate} />
                            )
                        }
                    />

                    <Route path="*" element={<h2>404: Страница не найдена</h2>} />
                </Routes>
            </main>

            <Footer />

            {/* Модальное окно авторизации/регистрации */}
            {/* Убрали key="auth-modal-instance" */}
            {showAuthModal && <AuthModal show={showAuthModal} onClose={closeAuthModal} navigateTo={navigate} />}
        </div>
    );
};

export default App;
