// src/pages/RegisterPage.js
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        lastName: '',
        firstName: '',
        middleName: '',
        dateOfBirth: '',
        phone: '', // Для отображения отформатированного номера
        email: '',
        password: '',
        confirmPassword: '',
        gdprConsent: false,
    });
    const [phoneRawDigits, setPhoneRawDigits] = useState(''); // Для хранения только цифр телефона для отправки на бэкенд
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const phoneInputRef = useRef(null); // Ref для управления позицией курсора

    // Функция для форматирования номера телефона
    // Принимает строку, содержащую только цифры (до 10 символов)
    const formatPhoneNumber = (digits) => {
        const cleanedDigits = String(digits).replace(/[^\d]/g, '');
        const phoneNumberLength = cleanedDigits.length;

        if (phoneNumberLength === 0) {
            return "";
        }

        let formatted = "+7"; // Всегда начинаем с +7
        let i = 0; // Индекс для обработанных цифр

        // Форматируем код города (первые 3 цифры)
        if (phoneNumberLength > i) {
            formatted += "(";
            formatted += cleanedDigits.substring(i, Math.min(i + 3, phoneNumberLength));
            if (phoneNumberLength >= i + 3) {
                formatted += ")";
            }
            i += 3;
        }

        // Форматируем следующие 3 цифры
        if (phoneNumberLength > i) {
            if (formatted.endsWith(')')) { // Добавляем пробел, если предыдущая часть закрыта скобкой
                formatted += " ";
            }
            formatted += cleanedDigits.substring(i, Math.min(i + 3, phoneNumberLength));
            i += 3;
        }

        // Форматируем следующие 2 цифры
        if (phoneNumberLength > i) {
            if (i > 0) { // Добавляем дефис, если предыдущая часть существует
                formatted += "-";
            }
            formatted += cleanedDigits.substring(i, Math.min(i + 2, phoneNumberLength));
            i += 2;
        }

        // Форматируем последние 2 цифры
        if (phoneNumberLength > i) {
            if (i > 0) { // Добавляем дефис, если предыдущая часть существует
                formatted += "-";
            }
            formatted += cleanedDigits.substring(i, Math.min(i + 2, phoneNumberLength));
        }

        return formatted;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'phone') {
            // Удаляем все нецифровые символы из введенного значения
            // Важно: здесь мы не пытаемся угадать, ввел ли пользователь "7" или "8"
            // вместо маски. Просто берем все цифры.
            const newRawDigits = value.replace(/[^\d]/g, '');

            // Ограничиваем количество цифр до 10 для основной части номера
            const limitedRawDigits = newRawDigits.slice(0, 10);
            
            setPhoneRawDigits(limitedRawDigits); // Сохраняем чистые 10 цифр

            setFormData(prev => ({
                ...prev,
                phone: formatPhoneNumber(limitedRawDigits), // Сохраняем отформатированный номер для отображения
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value,
            }));
        }
    };

    // useEffect для установки курсора после рендера, если поле телефона активно
    useEffect(() => {
        if (phoneInputRef.current && document.activeElement === phoneInputRef.current) {
            const rawDigitsLength = phoneRawDigits.length;
            let cursorPosition = 0;

            // Вычисляем позицию курсора на основе длины необработанных цифр
            // и структуры маски "+7(XXX) XXX-XX-XX"
            if (rawDigitsLength === 0) {
                cursorPosition = 3; // После "+7("
            } else if (rawDigitsLength <= 3) {
                cursorPosition = 3 + 1 + rawDigitsLength; // +7(XXX
            } else if (rawDigitsLength <= 6) {
                cursorPosition = 3 + 1 + 3 + 1 + (rawDigitsLength - 3); // +7(XXX) XXX
            } else if (rawDigitsLength <= 8) {
                cursorPosition = 3 + 1 + 3 + 1 + 3 + 1 + (rawDigitsLength - 6); // +7(XXX) XXX-XX
            } else if (rawDigitsLength <= 10) {
                cursorPosition = 3 + 1 + 3 + 1 + 3 + 1 + 2 + 1 + (rawDigitsLength - 8); // +7(XXX) XXX-XX-XX
            }
            
            // Убедимся, что курсор не выходит за пределы строки
            phoneInputRef.current.setSelectionRange(cursorPosition, cursorPosition);
        }
    }, [formData.phone, phoneRawDigits]);


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
                // ИСПРАВЛЕНИЕ ДЛЯ ДАТЫ: Преобразуем дату в ISO строку с UTC
                dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
                phone: phoneRawDigits || null, // Отправляем только необработанные цифры
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.confirmPassword, // Возможно, это поле не нужно для бэкенда, если он не требует подтверждения на уровне DTO
                gdprConsent: formData.gdprConsent,
            };

            console.log('Отправляемые данные (payload):', payload);

            const response = await axios.post('https://localhost:7232/api/Auth/register', payload);
            setSuccess(response.data.message);
            
            // Очистка формы
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
            setPhoneRawDigits(''); // Очищаем и необработанные цифры

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
                            if (Array.isArray(err.response.data.errors[key])) {
                                validationErrors.push(...err.response.data.errors[key]);
                            } else {
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
                            value={formData.phone} // Отображаем отформатированное значение
                            onChange={handleChange}
                            placeholder="+7 (XXX) XXX-XX-XX"
                            className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                            maxLength="18" // Увеличена максимальная длина для маски
                            required // Сделано обязательным, если требуется
                            ref={phoneInputRef} // Привязываем ref к полю ввода
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
