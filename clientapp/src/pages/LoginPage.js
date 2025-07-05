import React, { useState } from 'react';

const LoginPage = ({ navigateTo }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        // Простая валидация на стороне клиента
        if (!email || !password) {
            setError('Пожалуйста, введите email и пароль.');
            return;
        }
        console.log('Попытка входа:', { email, password });
        // Здесь будет логика отправки данных на ваш ASP.NET Backend
        // Временно симулируем успешный вход
        setTimeout(() => {
            alert('Вход успешен (демо)!');
            navigateTo('home'); // Перенаправляем на страницу профиля или товаров после входа
        }, 1000);
    };

    return (
        <section className="py-12 px-4 bg-gray-100 min-h-screen flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 max-w-md w-full">
                <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center">Вход</h2>
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                            Email:
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                            placeholder="Ваш Email"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                            Пароль:
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                            placeholder="Ваш Пароль"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-full hover:bg-indigo-700 transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-70 w-full"
                    >
                        Войти
                    </button>
                </form>
                <p className="mt-8 text-center text-gray-600">
                    Нет аккаунта?{' '}
                    <button
                        onClick={() => navigateTo('register')}
                        className="text-indigo-600 hover:text-indigo-800 font-semibold focus:outline-none"
                    >
                        Зарегистрироваться
                    </button>
                </p>
            </div>
        </section>
    );
};

export default LoginPage;