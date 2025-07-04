import React from 'react';
import { useNavigate } from 'react-router-dom'; // Импортируем useNavigate из react-router-dom
import ProductCard from '../components/ProductCard'; // Импортируем компонент ProductCard

const ProductsPage = ({ addToCart, products, searchTerm }) => {
    // Используем хук useNavigate для программной навигации
    const navigate = useNavigate();

    const filteredProducts = Array.isArray(products) ? products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    return (
        <section className="py-8 px-4 bg-gray-100 min-h-screen">
            <div className="container mx-auto">
                <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center">Наши Продукты</h2>
                {filteredProducts.length === 0 && searchTerm !== '' ? (
                    <p className="text-center text-gray-600 text-xl">
                        Продукты не найдены по запросу "{searchTerm}".
                    </p>
                ) : filteredProducts.length === 0 && searchTerm === '' ? (
                    <p className="text-center text-gray-600 text-xl">
                        Пока нет продуктов для отображения. Добавьте их в базу данных!
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                navigateTo={navigate} // Передаем функцию navigate из react-router-dom
                                addToCart={addToCart}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default ProductsPage;