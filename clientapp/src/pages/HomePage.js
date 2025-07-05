import React from 'react';

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
                    onClick={() => alert('Функционал пока не реализован!')}
                    className="bg-white text-teal-800 font-bold py-4 px-10 rounded-full shadow-lg hover:bg-gray-100 transform hover:scale-105 transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-70 text-xl"
                >
                    История Заказов
                </button>
                <button
                    onClick={() => alert('Функционал пока не реализован!')}
                    className="bg-teal-800 text-white font-bold py-4 px-10 rounded-full shadow-lg border-2 border-white hover:bg-teal-900 transform hover:scale-105 transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-70 text-xl"
                >
                    Настройки Аккаунта
                </button>
            </div>
            <p className="mt-8 text-lg opacity-90">
                С возвращением! Мы рады вас видеть.
            </p>
        </div>
    </section>
);

export default HomePage;