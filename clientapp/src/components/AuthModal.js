// src/components/AuthModal.js
import React, { useEffect } from 'react';

const AuthModal = ({ show, onClose, navigateTo }) => {
    // Этот useEffect будет срабатывать при каждом рендере компонента AuthModal и изменении пропса 'show'
    useEffect(() => {
        console.log('AuthModal useEffect: Пропс show изменился на:', show);
    }, [show]); // Запускается при изменении пропса 'show'

    // DEBUG LOG: Проверяем значение пропса 'show' непосредственно перед условным рендером
    console.log('AuthModal render: Значение пропса show:', show);

    if (!show) {
        // Если show = false, компонент не рендерит ничего
        return null;
    }

    // Если мы дошли сюда, значит show = true, и модальное окно должно быть видно
    console.log('AuthModal render: Модальное окно активно и пытается отобразиться на экране.');

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
            {/* ВРЕМЕННО: Убран класс animate-scaleIn для отладки видимости */}
            {/* Добавлен явный фон к внутреннему модальному окну для гарантированной видимости */}
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full relative transform transition-all duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl font-bold focus:outline-none"
                    aria-label="Close"
                >
                    &times;
                </button>
                <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    Вход или Регистрация
                </h3>
                <p className="text-gray-600 text-center mb-8">
                    Чтобы получить доступ к функциям профиля, пожалуйста, войдите или создайте новую учетную запись.
                </p>
                <div className="flex flex-col space-y-4">
                    <button
                        onClick={() => { navigateTo('/login'); onClose(); }}
                        className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-full hover:bg-indigo-700 transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-70"
                    >
                        Войти
                    </button>
                    <button
                        onClick={() => { navigateTo('/register'); onClose(); }}
                        className="bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-full hover:bg-gray-300 transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-gray-400 focus:ring-opacity-70"
                    >
                        Зарегистрироваться
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
