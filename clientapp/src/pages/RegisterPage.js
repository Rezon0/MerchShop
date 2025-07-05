// src/pages/RegisterPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        lastName: '',
        firstName: '',
        middleName: '',
        dateOfBirth: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        gdprConsent: false,
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Клиентская валидация: Пароли не совпадают
        if (formData.password !== formData.confirmPassword) {
            setError('Пароли не совпадают!');
            return;
        }

        // Клиентская валидация: Минимальная длина пароля
        if (formData.password.length < 6) {
            setError('Пароль должен быть не менее 6 символов.');
            return;
        }

        // Клиентская валидация: Согласие с GDPR
        if (!formData.gdprConsent) {
            setError('Вы должны согласиться с условиями обработки персональных данных.');
            return;
        }

        try {
            const payload = {
                lastName: formData.lastName,
                firstName: formData.firstName,
                middleName: formData.middleName || null,
                dateOfBirth: formData.dateOfBirth,
                phone: formData.phone,
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                gdprConsent: formData.gdprConsent,
            };

            console.log('Отправляемые данные (payload):', payload);

            const response = await axios.post('https://localhost:7232/api/Auth/register', payload);
            setSuccess(response.data.message);
            
            setFormData({
                lastName: '',
                firstName: '',
                middleName: '',
                dateOfBirth: '',
                phone: '',
                email: '',
                password: '',
                confirmPassword: '',
                gdprConsent: false,
            });

            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            console.error('Ошибка регистрации (полный объект ошибки):', err);

            if (err.response && err.response.data) {
                if (err.response.data.message) {
                    setError(err.response.data.message);
                }
                else if (err.response.data.errors) {
                    const validationErrors = [];
                    for (const key in err.response.data.errors) {
                        if (err.response.data.errors.hasOwnProperty(key)) {
                            // Проверяем, является ли значение массивом, прежде чем использовать spread
                            if (Array.isArray(err.response.data.errors[key])) {
                                validationErrors.push(...err.response.data.errors[key]);
                            } else {
                                // Если это не массив, добавляем как есть (может быть строка)
                                validationErrors.push(err.response.data.errors[key]);
                            }
                        }
                    }
                    if (validationErrors.length > 0) {
                         setError(`Ошибка валидации: ${validationErrors.join(', ')}`);
                    } else if (err.response.data.title) {
                        setError(err.response.data.title);
                    } else {
                        setError('Произошла ошибка валидации на сервере.');
                    }
                } else {
                    setError('Произошла ошибка при регистрации. Пожалуйста, попробуйте еще раз.');
                }
            } else {
                setError('Ошибка сети или сервера. Пожалуйста, попробуйте позже.');
            }
        }
    };

    return (
        <section className="py-12 px-4 bg-gray-100 min-h-screen flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 max-w-md w-full">
                <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center">Регистрация</h2>
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
                        <label htmlFor="lastName" className="block text-gray-700 text-sm font-bold mb-2">
                            Фамилия:
                        </label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="firstName" className="block text-gray-700 text-sm font-bold mb-2">
                            Имя:
                        </label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="middleName" className="block text-gray-700 text-sm font-bold mb-2">
                            Отчество (необязательно):
                        </label>
                        <input
                            type="text"
                            id="middleName"
                            name="middleName"
                            value={formData.middleName}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        />
                    </div>
                    <div>
                        <label htmlFor="dateOfBirth" className="block text-gray-700 text-sm font-bold mb-2">
                            Дата рождения:
                        </label>
                        <input
                            type="date"
                            id="dateOfBirth"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-gray-700 text-sm font-bold mb-2">
                            Телефон:
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+X (XXX) XXX-XX-XX"
                            className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                            required
                        />
                    </div>
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
                            className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">
                            Подтвердите Пароль:
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                            required
                        />
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="gdprConsent"
                            name="gdprConsent"
                            checked={formData.gdprConsent}
                            onChange={handleChange}
                            className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            required
                        />
                        <label htmlFor="gdprConsent" className="text-gray-700 text-sm">
                            Я согласен с условиями обработки персональных данных (GDPR)
                        </label>
                    </div>
                    <button
                        type="submit"
                        className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-full hover:bg-indigo-700 transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-70 w-full"
                    >
                        Зарегистрироваться
                    </button>
                </form>
                <p className="mt-8 text-center text-gray-600">
                    Уже есть аккаунт?{' '}
                    <button
                        onClick={() => navigate('/login')}
                        className="text-indigo-600 hover:text-indigo-800 font-semibold focus:outline-none"
                    >
                        Войти
                    </button>
                </p>
            </div>
        </section>
    );
};

export default RegisterPage;
