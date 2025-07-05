import React from 'react';

const ProductCard = ({ product, navigateTo, addToCart }) => {
    const imageUrl = product.productDesigns &&
         Array.isArray(product.productDesigns.$values) &&
         product.productDesigns.$values.length > 0 &&
         product.productDesigns.$values[0].design?.imageUrl
        ? product.productDesigns.$values[0].design.imageUrl
        : product.primaryImageUrl || 'https://placehold.co/400x300/6b7280/ffffff?text=Изображение+не+найдено';

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition duration-300 ease-in-out flex flex-col">
            <button onClick={() => navigateTo('productDetail', product)} className="block w-full h-48 focus:outline-none">
                <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        console.error(`Ошибка загрузки изображения для ${product.name}: ${e.target.src}`);
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/400x300/6b7280/ffffff?text=Изображение+не+найдено';
                    }}
                />
            </button>
            <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-4 flex-grow">{product.description}</p>
                <div className="flex justify-between items-center mt-auto">
                    <span className="text-2xl font-bold text-indigo-600">${product.price.toFixed(2)}</span>
                    <button
                        onClick={() => addToCart(product)}
                        className="bg-indigo-600 text-white px-5 py-2 rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-colors duration-200 text-sm"
                    >
                        Добавить в Корзину
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;