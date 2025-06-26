import React, { useState, useEffect } from 'react';

// ==========================================================
// Custom Hooks (Вспомогательные хуки)
// ==========================================================

// Хук для debounce: задерживает обновление значения на заданное время
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // Устанавливаем таймер для обновления debouncedValue
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Функция очистки: отменяет таймер, если значение изменилось до истечения задержки
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]); // Эффект перезапускается, когда меняется value или delay

    return debouncedValue;
};

// ==========================================================
// Mock Data (Мок-данные)
// ==========================================================

const mockProducts = [
    {
        id: 1,
        name: 'Футболка "Космический Путешественник"',
        price: 19.99,
        image: 'https://placehold.co/400x300/6b7280/ffffff?text=Футболка',
        description: 'Высококачественная хлопковая футболка с уникальным принтом, вдохновленным межгалактическими приключениями.',
        longDescription: 'Погрузитесь в бесконечные просторы космоса с нашей эксклюзивной футболкой "Космический Путешественник". Изготовлена из 100% органического хлопка, обеспечивает максимальный комфорт и долговечность. Идеально подходит для повседневной носки или как стильный элемент вашей коллекции мерча. Доступна в размерах S, M, L, XL.'
    },
    {
        id: 2,
        name: 'Кружка "Программист"',
        price: 12.50,
        image: 'https://placehold.co/400x300/4b5563/ffffff?text=Кружка',
        description: 'Кружка для настоящих мастеров кода, поможет сосредоточиться на сложных алгоритмах.',
        longDescription: 'Начните свой день с идеальной кружки для любого программиста. Сделана из высококачественной керамики, объем 350 мл. Отлично держит тепло и выдерживает бесчисленные циклы работы над кодом. Можно мыть в посудомоечной машине и использовать в микроволновой печи.'
    },
    {
        id: 3,
        name: 'Худи "Cyberpunk City"',
        price: 49.99,
        image: 'https://placehold.co/400x300/374151/ffffff?text=Худи',
        description: 'Уютное худи для фанатов киберпанка, с ярким дизайном неонового города будущего.',
        longDescription: 'Погрузитесь в атмосферу неонового мегаполиса с нашим худи "Cyberpunk City". Мягкий флис внутри обеспечит тепло и уют, а прочный внешний материал — долговечность. Футуристический принт светится в темноте, делая вас заметным в любой толпе. Идеально для прохладных вечеров или для похода на гик-конвенции.'
    },
    {
        id: 4,
        name: 'Брелок "Маленький Дракон"',
        price: 7.99,
        image: 'https://placehold.co/400x300/1f2937/ffffff?text=Брелок',
        description: 'Милый брелок для ключей или рюкзака, талисман удачи для каждого фаната фэнтези.',
        longDescription: 'Этот очаровательный брелок в виде маленького дракона станет вашим верным спутником. Изготовлен из прочного акрила, устойчив к царапинам и выцветанию. Отличный подарок для любителей фэнтези, драконов и всего волшебного. Легко крепится к ключам, рюкзаку или сумке.'
    },
    {
        id: 5,
        name: 'Плакат "Ретро Футуризм"',
        price: 14.99,
        image: 'https://placehold.co/400x300/2c3e50/ffffff?text=Плакат',
        description: 'Винтажный постер с изображением футуристического города, идеален для декора.',
        longDescription: 'Добавьте нотку ретро-футуризма в свой интерьер с этим уникальным плакатом. Выполнен на высококачественной матовой бумаге плотностью 200 г/м². Яркие цвета и детализированный дизайн сделают его центром внимания в любой комнате. Размеры: 60x90 см.'
    },
];

// ==========================================================
// Components (Компоненты)
// ==========================================================

// Компонент заголовка и навигации
const Header = ({ currentPage, navigateTo, cartItems, searchTerm, setSearchTerm, onProfileClick }) => (
    <header className="bg-gray-800 text-white p-4 shadow-md rounded-b-lg">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <h1 className="text-3xl font-bold text-indigo-300">
                Мерч
            </h1>
            {/* Поле поиска */}
            <div className="flex-grow flex justify-center px-4 sm:px-0">
                <input
                    type="text"
                    placeholder="Поиск товаров..."
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
                            onClick={onProfileClick} // Теперь эта кнопка вызывает новую функцию
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

// Компонент страницы "Профиль" (ранее HomePage) - теперь его будет видно после авторизации
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
                    onClick={() => alert('Функционал пока не реализован!')} // Заглушка
                    className="bg-white text-teal-800 font-bold py-4 px-10 rounded-full shadow-lg hover:bg-gray-100 transform hover:scale-105 transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-70 text-xl"
                >
                    История заказов
                </button>
                <button
                    onClick={() => alert('Функционал пока не реализован!')} // Заглушка
                    className="bg-teal-800 text-white font-bold py-4 px-10 rounded-full shadow-lg border-2 border-white hover:bg-teal-900 transform hover:scale-105 transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-70 text-xl"
                >
                    Настройки аккаунта
                </button>
            </div>
            <p className="mt-8 text-lg opacity-90">
                Добро пожаловать обратно! Мы рады видеть вас.
            </p>
        </div>
    </section>
);


// Компонент страницы товаров
const ProductsPage = ({ navigateTo, addToCart, products, searchTerm }) => {
    // Фильтруем товары на основе searchTerm (debouncedSearchTerm передается из App)
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <section className="py-8 px-4 bg-gray-100 min-h-screen">
            <div className="container mx-auto">
                <h2 className=" text-4xl font-bold text-gray-800 mb-8 text-center">Наши Товары</h2>
                {filteredProducts.length === 0 && searchTerm !== '' ? (
                    <p className="text-center text-gray-600 text-xl">
                        По запросу "{searchTerm}" ничего не найдено.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredProducts.map((product) => (
                            <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition duration-300 ease-in-out flex flex-col">
                                <button onClick={() => navigateTo('productDetail', product)} className="block w-full h-48 focus:outline-none">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x300/6b7280/ffffff?text=Image+Not+Found'; }}
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
                                            Добавить в корзину
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}




            </div>

        </section>

    );
};

// Компонент страницы деталей продукта
const ProductDetailPage = ({ selectedProduct, navigateTo, addToCart }) => {
    if (!selectedProduct) {
        return (
            <section className="py-8 px-4 bg-gray-100 min-h-screen flex items-center justify-center">
                <p className="text-gray-600 text-xl">Продукт не найден.</p>
            </section>
        );
    }

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
                    Назад к товарам
                </button>

                <div className="flex flex-col md:flex-row gap-8">
                    <div className="md:w-1/2">
                        <img
                            src={selectedProduct.image}
                            alt={selectedProduct.name}
                            className="w-full h-auto rounded-lg shadow-md max-h-96 object-contain"
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x450/6b7280/ffffff?text=Image+Not+Found'; }}
                        />
                    </div>
                    <div className="md:w-1/2 flex flex-col justify-center">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">{selectedProduct.name}</h2>
                        <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                            {selectedProduct.longDescription || selectedProduct.description}
                        </p>
                        <div className="flex items-center mb-6">
                            <span className="text-4xl font-extrabold text-indigo-700 mr-4">${selectedProduct.price.toFixed(2)}</span>
                            <span className="text-gray-500 line-through text-lg">${(selectedProduct.price * 1.2).toFixed(2)}</span>
                        </div>
                        <button
                            onClick={() => addToCart(selectedProduct)}
                            className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-indigo-700 transform hover:scale-105 transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-70 text-lg"
                        >
                            Добавить в корзину
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

// Компонент страницы корзины
const CartPage = ({ cartItems, navigateTo, removeFromCart, updateQuantity }) => {
    const total = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    return (
        <section className="py-8 px-4 bg-gray-100 min-h-screen">
            <div className="container mx-auto">
                <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center">Ваша Корзина</h2>
                {cartItems.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                        <p className="text-gray-600 text-lg">Ваша корзина пока пуста.</p>
                        <button
                            onClick={() => navigateTo('products')}
                            className="mt-6 bg-indigo-600 text-white font-bold py-2 px-6 rounded-full hover:bg-indigo-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                        >
                            Вернуться к покупкам
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="divide-y divide-gray-200">
                            {cartItems.map(item => (
                                <div key={item.product.id} className="flex items-center py-4">
                                    <img
                                        src={item.product.image}
                                        alt={item.product.name}
                                        className="w-20 h-20 object-cover rounded-md mr-4 shadow-sm"
                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/80x80/6b7280/ffffff?text=Img'; }}
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
                            ))}
                        </div>
                        <div className="mt-8 pt-4 border-t-2 border-gray-200 flex justify-end items-center">
                            <span className="text-2xl font-bold text-gray-800 mr-4">Итого:</span>
                            <span className="text-3xl font-extrabold text-indigo-800">${total.toFixed(2)}</span>
                        </div>
                        <div className="mt-6 text-right">
                            <button className="bg-green-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-green-700 transform hover:scale-105 transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-70 text-lg">
                                Оформить заказ
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

// Компонент подвала
const Footer = () => (
    <footer className="bg-gray-800 text-white p-4 mt-8 shadow-inner rounded-t-lg">
        <div className="container mx-auto text-center text-sm">
            &copy; {new Date().getFullYear()} Merch Shop. Все права защищены.
        </div>
    </footer>
);

// Компонент модального окна авторизации/регистрации
const AuthModal = ({ show, onClose }) => {
    if (!show) return null; // Если модальное окно не должно быть показано, не рендерим ничего

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full relative transform transition-all duration-300 scale-95 opacity-0 animate-scaleIn">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl font-bold focus:outline-none"
                    aria-label="Закрыть"
                >
                    &times;
                </button>
                <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    Войти или Зарегистрироваться
                </h3>
                <p className="text-gray-600 text-center mb-8">
                    Для доступа к функциям профиля, пожалуйста, авторизуйтесь или создайте новый аккаунт.
                </p>
                <div className="flex flex-col space-y-4">
                    <button
                        onClick={() => alert('Форма авторизации будет здесь.')}
                        className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-full hover:bg-indigo-700 transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-70"
                    >
                        Авторизация
                    </button>
                    <button
                        onClick={() => alert('Форма регистрации будет здесь.')}
                        className="bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-full hover:bg-gray-300 transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-gray-400 focus:ring-opacity-70"
                    >
                        Регистрация
                    </button>
                </div>
            </div>
        </div>
    );
};


// ==========================================================
// Main App Component (Главный компонент приложения)
// ==========================================================
const App = () => {
    const [currentPage, setCurrentPage] = useState('products');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300); // Задержка 300ms для debounce
    const [showAuthModal, setShowAuthModal] = useState(false); // Новое состояние для модального окна

    // Функция для навигации по страницам
    const navigateTo = (page, product = null) => {
        setCurrentPage(page);
        setSelectedProduct(product);
        setShowAuthModal(false); // Закрываем модальное окно при навигации
    };

    // Функция для открытия модального окна авторизации
    const handleProfileClick = () => {
        setShowAuthModal(true);
        // Мы не меняем currentPage здесь, т.к. мы показываем модальное окно,
        // а не переходим на страницу профиля напрямую.
    };

    const addToCart = (product) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.product.id === product.id);
            if (existingItem) {
                return prevItems.map(item =>
                    item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                return [...prevItems, { product, quantity: 1 }];
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
        switch (currentPage) {
            case 'home':
                // В будущем, когда будет авторизация, здесь может быть условие:
                // if (isLoggedIn) return <HomePage navigateTo={navigateTo} />;
                // else return <RedirectToLoginPage />;
                // Сейчас это заглушка, которая пока не используется напрямую через кнопку "Профиль"
                return <HomePage navigateTo={navigateTo} />;
            case 'products':
                return <ProductsPage
                            navigateTo={navigateTo}
                            addToCart={addToCart}
                            products={mockProducts}
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
                return <ProductsPage // По умолчанию отображаем товары
                            navigateTo={navigateTo}
                            addToCart={addToCart}
                            products={mockProducts}
                            searchTerm={debouncedSearchTerm}
                        />;
        }
    };

    return (
        <div className="min-h-screen flex flex-col font-sans bg-gray-50">
            {/* Глобальные CSS-анимации для плавного появления модального окна и других элементов */}
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
            <AuthModal show={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </div>
    );
};

export default App;
