// src/pages/LoginPage.js
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom'; // Импорт useNavigate
import { AuthContext } from '../App'; // Убедитесь, что путь к App.js корректен

function LoginPage({ API_BASE_URL, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { handleLoginSuccess: contextLoginSuccess, setShowAuthModal } = useContext(AuthContext);
  const navigate = useNavigate(); // Инициализация useNavigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/Auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      // Логируем полный статус и данные ответа
      console.log('Login API response status:', response.status);
      const data = await response.json();
      console.log('Login API response data:', data); // <<< ВАЖНО: Проверьте это в консоли

      if (!response.ok) {
        throw new Error(data.message || 'Ошибка входа');
      }

      const token = data.accessToken; // Ожидаем, что бэкенд вернет объект с accessToken
      console.log('Received access token from API response:', token); // <<< ВАЖНО: Проверьте, что это строка

      if (onLoginSuccess) {
        onLoginSuccess(token); // Передаем полученный токен
      } else if (contextLoginSuccess) {
        contextLoginSuccess(token);
      }
      if (setShowAuthModal) {
        setShowAuthModal(false); // Закрыть модальное окно после входа
      }
      navigate('/'); // Перенаправить на главную страницу после успешного входа
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Неверный email или пароль.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Вход</h2>
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Пароль
          </label>
          <input
            type="password"
            id="password"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Войти
          </button>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
