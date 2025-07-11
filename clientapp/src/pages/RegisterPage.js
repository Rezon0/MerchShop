// src/pages/RegisterPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function RegisterPage({ API_BASE_URL }) {
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
  const [validationErrors, setValidationErrors] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Сбрасываем ошибки при изменении полей
    if (name === 'password' || name === 'confirmPassword') {
      setValidationErrors([]);
    }
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    
    // Ограничиваем длину номера (11 цифр для России)
    if (value.length > 11) {
      value = value.substring(0, 11);
    }

    // Форматируем номер по маске
    let formattedValue = '';
    if (value.length > 0) {
      formattedValue = '+7 (';
      if (value.length > 1) {
        formattedValue += value.substring(1, 4);
      }
      if (value.length > 4) {
        formattedValue += ') ' + value.substring(4, 7);
      }
      if (value.length > 7) {
        formattedValue += '-' + value.substring(7, 9);
      }
      if (value.length > 9) {
        formattedValue += '-' + value.substring(9, 11);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      phone: formattedValue,
    }));
  };

  const validateForm = () => {
    const errors = [];
    
    // Проверка обязательных полей
    if (!formData.lastName) errors.push('Фамилия обязательна');
    if (!formData.firstName) errors.push('Имя обязательно');
    if (!formData.dateOfBirth) errors.push('Дата рождения обязательна');
    if (!formData.email) errors.push('Email обязателен');
    
    // Проверка паролей
    if (!formData.password) {
      errors.push('Пароль обязателен');
    } else if (formData.password.length < 6) {
      errors.push('Пароль должен быть не менее 6 символов');
    }
    
    if (!formData.confirmPassword) {
      errors.push('Подтверждение пароля обязательно');
    } else if (formData.password !== formData.confirmPassword) {
      errors.push('Пароли не совпадают');
    }
    
    // Проверка телефона
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!cleanPhone) {
      errors.push('Телефон обязателен');
    } else if (cleanPhone.length !== 11) {
      errors.push('Телефон должен содержать 11 цифр');
    }
    
    // Проверка согласия
    if (!formData.gdprConsent) {
      errors.push('Необходимо согласие с обработкой персональных данных');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateForm()) {
      return;
    }

    try {
      const payload = {
        lastName: formData.lastName,
        firstName: formData.firstName,
        middleName: formData.middleName || null,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
        phone: formData.phone.replace(/\D/g, ''),
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        gdprConsent: formData.gdprConsent,
      };

      const response = await axios.post(`${API_BASE_URL}/Auth/register`, payload);
      setSuccess(response.data.message || 'Регистрация прошла успешно!');
      
      // Очищаем форму
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

      // Перенаправляем на страницу входа через 2 секунды
      setTimeout(() => navigate('/login'), 2000);

    } catch (err) {
      console.error('Ошибка регистрации:', err);
      
      if (axios.isAxiosError(err) && err.response) {
        // Обработка ошибок валидации от сервера
        if (err.response.data.errors) {
          const serverErrors = Object.values(err.response.data.errors).flat();
          setError(serverErrors.join(', '));
        } else if (err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError('Произошла ошибка при регистрации');
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
        
        {/* Сообщения об ошибках */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {/* Сообщения об успехе */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6" role="alert">
            <span className="block sm:inline">{success}</span>
          </div>
        )}
        
        {/* Ошибки валидации */}
        {validationErrors.length > 0 && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <ul className="list-disc pl-5">
              {validationErrors.map((err, index) => (
                <li key={index}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Поле фамилии */}
          <div>
            <label htmlFor="lastName" className="block text-gray-700 text-sm font-bold mb-2">
              Фамилия: *
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
          
          {/* Поле имени */}
          <div>
            <label htmlFor="firstName" className="block text-gray-700 text-sm font-bold mb-2">
              Имя: *
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
          
          {/* Поле отчества */}
          <div>
            <label htmlFor="middleName" className="block text-gray-700 text-sm font-bold mb-2">
              Отчество:
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
          
          {/* Поле даты рождения */}
          <div>
            <label htmlFor="dateOfBirth" className="block text-gray-700 text-sm font-bold mb-2">
              Дата рождения: *
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
          
          {/* Поле телефона с маской */}
          <div>
            <label htmlFor="phone" className="block text-gray-700 text-sm font-bold mb-2">
              Телефон: *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handlePhoneChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              placeholder="+7 (___) ___-__-__"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Формат: +7 (XXX) XXX-XX-XX</p>
          </div>
          
          {/* Поле email */}
          <div>
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
              Email: *
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
          
          {/* Поле пароля */}
          <div>
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
              Пароль: *
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
          
          {/* Поле подтверждения пароля */}
          <div>
            <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">
              Подтвердите пароль: *
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
          
          {/* Чекбокс согласия */}
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
              Я согласен с условиями обработки персональных данных (GDPR) *
            </label>
          </div>
          
          {/* Кнопка отправки формы */}
          <button
            type="submit"
            className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-full hover:bg-indigo-700 transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-70 w-full"
          >
            Зарегистрироваться
          </button>
        </form>
        
        {/* Ссылка на страницу входа */}
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
}

export default RegisterPage;