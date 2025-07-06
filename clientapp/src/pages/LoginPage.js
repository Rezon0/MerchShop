// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage = ({ navigateTo }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await axios.post('https://localhost:7232/api/Auth/login', formData);
            setSuccess(response.data.message);

            // Сохраняем токены в localStorage
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);
            localStorage.setItem('userId', response.data.userId);
            localStorage.setItem('userName', response.data.userName);

            // Перенаправляем пользователя на страницу профиля или главную
            setTimeout(() => {
                navigate('/home'); // Или '/products'
                window.location.reload(); // Перезагружаем, чтобы App.js обновил состояние авторизации
            }, 1000);

        } catch (err) {
            console.error('Ошибка входа:', err.response || err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Не удалось войти. Проверьте Email и пароль.');
            }
        }
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
                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6" role="alert">
                        <span className="block sm:inline">{success}</span>
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
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
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
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
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
                        onClick={() => navigate('/register')}
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