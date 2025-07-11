// App.js
import React, { useState, useEffect, createContext, useContext, useCallback } from 'react'; // Добавлен useCallback
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import ProductCard from './components/ProductCard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';
import ProfilePage from './pages/ProfilePage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import CheckoutPage from './pages/CheckoutPage'; // Импорт новой страницы
import './App.css';
import { ShoppingCart, User, LogOut, Package, Home } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

// Контекст для аутентификации
export const AuthContext = createContext(null);

// Контекст для корзины
export const CartContext = createContext(null);

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken') || null);
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();

  const API_BASE_URL = 'https://localhost:7232/api';

  // Функция для получения токена из localStorage
  const getAccessToken = () => {
    const token = localStorage.getItem('accessToken');
    console.log('getAccessToken called, token from localStorage:', token ? 'Exists' : 'Does not exist');
    return token;
  };

  // Мемоизированная функция для получения элементов корзины
  const fetchCartItems = useCallback(async () => {
    const token = getAccessToken();
    console.log('fetchCartItems called. Current isLoggedIn state:', isLoggedIn, 'Token:', token ? 'Exists' : 'Does not exist');

    if (!token) {
      console.warn('No access token found for fetching cart. User might not be logged in.');
      setCartItems([]);
      return;
    }

    try {
      console.log('Attempting to fetch cart with token...');
      const response = await fetch(`${API_BASE_URL}/Cart`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Unauthorized access to cart. Token might be expired or invalid. Logging out.');
          handleLogout();
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Cart fetched successfully:', data);
      setCartItems(data);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    }
  }, [isLoggedIn, navigate]); // Зависимости для useCallback: isLoggedIn, navigate, getAccessToken (неявная)

  // Мемоизированная функция для добавления товара в корзину
  const addToCart = useCallback(async (productDesignId, quantity = 1) => {
    const token = getAccessToken();
    if (!token) {
      setShowAuthModal(true);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/Cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productDesignId: productDesignId,
          quantity: quantity
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Unauthorized access to cart. Token might be expired or invalid. Logging out.');
        }
        const errorData = await response.json();
        console.error('Error adding to cart:', errorData.message || `HTTP error! Status: ${response.status}`);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Item added to cart successfully:', data);
      fetchCartItems(); // Обновить корзину после добавления
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  }, [fetchCartItems, setShowAuthModal]); // Зависимости для useCallback: fetchCartItems, setShowAuthModal

  // Мемоизированная функция для удаления товара из корзины
  const removeFromCart = useCallback(async (cartItemId) => {
    const token = getAccessToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/Cart/remove/${cartItemId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Unauthorized access to cart. Token might be expired or invalid. Logging out.');
          handleLogout();
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      console.log('Item removed from cart successfully.');
      fetchCartItems();
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  }, [fetchCartItems]); // Зависимости для useCallback: fetchCartItems

  // Мемоизированная функция для обновления количества товара в корзине
  const updateCartItemQuantity = useCallback(async (cartItemId, newQuantity) => {
    const token = getAccessToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/Cart/update-quantity`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cartItemId, newQuantity })
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Unauthorized access to cart. Token might be expired or invalid. Logging out.');
          handleLogout();
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      console.log('Cart item quantity updated successfully.');
      fetchCartItems();
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
    }
  }, [fetchCartItems]); // Зависимости для useCallback: fetchCartItems

  // Мемоизированная функция для успешного входа
  const handleLoginSuccess = useCallback((token) => {
    localStorage.setItem('accessToken', token);
    setAccessToken(token);
    setIsLoggedIn(true);
    setShowAuthModal(false);
    console.log('handleLoginSuccess: Token received (type and value):', typeof token, token);
    try {
      const decodedToken = jwtDecode(token);
      setUser(decodedToken);
    } catch (error) {
      console.error('Failed to decode token:', error);
      setUser(null);
    }
    console.log('handleLoginSuccess called. Setting user data and token.');
    fetchCartItems();
    navigate('/');
  }, [fetchCartItems, navigate, setShowAuthModal]); // Зависимости для useCallback: fetchCartItems, navigate, setShowAuthModal

  // Мемоизированная функция для выхода из системы
  const handleLogout = useCallback(() => {
    localStorage.removeItem('accessToken');
    setAccessToken(null);
    setIsLoggedIn(false);
    setUser(null);
    setCartItems([]);
    console.log('handleLogout called. Clearing session.');
    navigate('/');
  }, [navigate]); // Зависимости для useCallback: navigate

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      console.log('App useEffect: Initial token (type and value):', typeof token, token);
      try {
        const decodedToken = jwtDecode(token);
        if (decodedToken.exp * 1000 < Date.now()) {
          console.warn('Access token expired. Logging out.');
          handleLogout();
        } else {
          setIsLoggedIn(true);
          setUser(decodedToken);
          console.log('Initial load: User is logged in.');
          fetchCartItems();
        }
      } catch (error) {
        console.error('Failed to decode token on initial load:', error);
        handleLogout();
      }
    } else {
      setIsLoggedIn(false);
      console.log('Initial load: User is NOT logged in.');
    }
  }, [fetchCartItems, handleLogout]); // Зависимости для useEffect: fetchCartItems, handleLogout

  useEffect(() => {
    console.log('isLoggedIn or accessToken changed. isLoggedIn:', isLoggedIn, 'accessToken:', accessToken ? 'Exists' : 'Does not exist');
  }, [isLoggedIn, accessToken]);

  useEffect(() => {
    console.log('App.js: showAuthModal изменилось на:', showAuthModal);
  }, [showAuthModal]);

  // Вычисляем общее количество товаров в корзине
  const totalCartQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, handleLoginSuccess, handleLogout, setShowAuthModal }}>
      <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateCartItemQuantity, fetchCartItems }}>
        <div className="min-h-screen bg-gray-100 flex flex-col">
          <header className="bg-white shadow-md p-4 flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-gray-800">MerchShop</Link>
            <nav className="flex items-center space-x-4">
              <Link to="/" className="text-gray-600 hover:text-gray-900 flex items-center">
                <Home className="mr-1" size={20} /> Товары
              </Link>
              {isLoggedIn ? (
                <>
                  <Link to="/cart" className="text-gray-600 hover:text-gray-900 flex items-center">
                    <ShoppingCart className="mr-1" size={20} /> Корзина ({totalCartQuantity})
                  </Link>
                  <Link 
                    to="/profile" 
                    className="text-gray-600 hover:text-gray-900 flex items-center"
                    onClick={() => console.log('Навигация: Клик по Профилю (/profile)')} // Добавлено логирование
                  >
                    <User className="mr-1" size={20} /> Профиль
                  </Link>
                  <Link 
                    to="/orders" 
                    className="text-gray-600 hover:text-gray-900 flex items-center"
                    onClick={() => console.log('Навигация: Клик по Заказам (/orders)')} // Добавлено логирование
                  >
                    <Package className="mr-1" size={20} /> Заказы
                  </Link>
                  <button onClick={handleLogout} className="text-gray-600 hover:text-gray-900 flex items-center">
                    <LogOut className="mr-1" size={20} /> Выйти
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setShowAuthModal(true)} className="text-gray-600 hover:text-gray-900 flex items-center">
                    <User className="mr-1" size={20} /> Войти
                  </button>
                  <Link to="/register" className="text-gray-600 hover:text-gray-900 flex items-center">
                    Зарегистрироваться
                  </Link>
                </>
              )}
            </nav>
          </header>

          <main className="flex-grow container mx-auto p-4">
            <Routes>
              <Route path="/" element={<ProductsPage API_BASE_URL={API_BASE_URL} onAddToCart={addToCart} />} />
              <Route path="/cart" element={<CartPage API_BASE_URL={API_BASE_URL} />} />
              <Route path="/profile" element={<ProfilePage API_BASE_URL={API_BASE_URL} />} />
              <Route path="/orders" element={<OrderHistoryPage API_BASE_URL={API_BASE_URL} />} />
              <Route path="/checkout" element={<CheckoutPage API_BASE_URL={API_BASE_URL} />} />
              <Route path="/login" element={<LoginPage API_BASE_URL={API_BASE_URL} />} />
              <Route path="/register" element={<RegisterPage API_BASE_URL={API_BASE_URL} />} />
            </Routes>
          </main>

          {showAuthModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full relative">
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
                >
                  &times;
                </button>
                <LoginPage API_BASE_URL={API_BASE_URL} onLoginSuccess={handleLoginSuccess} />
              </div>
            </div>
          )}
        </div>
      </CartContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;

function ProductsPage({ API_BASE_URL, onAddToCart }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/Products`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
        alert('Не удалось загрузить товары из API. Пожалуйста, попробуйте позже.');
      }
    };

    fetchProducts();
  }, [API_BASE_URL]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map(product => (
        <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
      ))}
    </div>
  );
}
