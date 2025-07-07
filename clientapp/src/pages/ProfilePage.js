// src/components/ProfilePage.js
import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../App'; // Убедитесь, что путь к App.js корректен

function ProfilePage({ API_BASE_URL }) {
  const { user, isLoggedIn, handleLogout } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isLoggedIn) {
        setLoading(false);
        setError('Вы не авторизованы для просмотра профиля.');
        return;
      }

      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        setError('Токен авторизации отсутствует.');
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/Auth/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            handleLogout(); // Токен недействителен, выходим
            throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
          }
          throw new Error(`Ошибка загрузки профиля: ${response.statusText}`);
        }

        const data = await response.json();
        setProfileData(data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.message || 'Не удалось загрузить данные профиля.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isLoggedIn, API_BASE_URL, handleLogout]);

  if (loading) {
    return <div className="text-center text-gray-600">Загрузка профиля...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!profileData) {
    return <div className="text-center text-gray-600">Данные профиля не найдены.</div>;
  }

  return (
    <div className="container mx-auto p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Мой Профиль</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg">
        <div className="font-semibold text-gray-700">Имя:</div>
        <div className="text-gray-900">{profileData.firstName}</div>

        <div className="font-semibold text-gray-700">Фамилия:</div>
        <div className="text-gray-900">{profileData.lastName}</div>

        <div className="font-semibold text-gray-700">Email:</div>
        <div className="text-gray-900">{profileData.email}</div>

        {profileData.phone && (
          <>
            <div className="font-semibold text-gray-700">Телефон:</div>
            <div className="text-gray-900">{profileData.phone}</div>
          </>
        )}
        {profileData.dateOfBirth && (
          <>
            <div className="font-semibold text-gray-700">Дата рождения:</div>
            <div className="text-gray-900">{new Date(profileData.dateOfBirth).toLocaleDateString()}</div>
          </>
        )}
      </div>
      <div className="mt-8 text-center">
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Выйти из аккаунта
        </button>
      </div>
    </div>
  );
}

export default ProfilePage;
