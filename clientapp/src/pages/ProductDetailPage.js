import React from 'react';

const ProductDetailPage = ({ selectedProduct, navigateTo, addToCart }) => {
    if (!selectedProduct) {
        return (
            <section className="py-8 px-4 bg-gray-100 min-h-screen flex items-center justify-center">
                <p className="text-gray-600 text-xl">Продукт не найден.</p>
            </section>
        );
    }

    const imageUrl = selectedProduct.productDesigns &&
                 Array.isArray(selectedProduct.productDesigns.$values) &&
                 selectedProduct.productDesigns.$values.length > 0 &&
                 selectedProduct.productDesigns.$values[0].design?.imageUrl
    ? selectedProduct.productDesigns.$values[0].design.imageUrl
    : selectedProduct.primaryImageUrl || 'https://placehold.co/600x450/6b7280/ffffff?text=Изображение+не+найдено';

    return (
        <section className="py-12 px-4 bg-gray-100 min-h-screen">
            <div className="container mx-auto bg-white rounded-xl shadow-lg p-8 md:p-12">
                <button
                    onClick={() => navigateTo('products')}
                    className="text-indigo-600 hover:text-indigo-800 flex items-center mb-6 text-lg transition-colors duration-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Вернуться к Продуктам
                </button>

                <div className="flex flex-col md:flex-row gap-8">
                    <div className="md:w-1/2">
                        <img
                            src={imageUrl}
                            alt={selectedProduct.name}
                            className="w-full h-auto rounded-lg shadow-md max-h-96 object-contain"
                            onError={(e) => {
                                console.error(`Ошибка загрузки детального изображения для ${selectedProduct.name}: ${e.target.src}`);
                                e.target.onerror = null;
                                e.target.src = 'https://placehold.co/600x450/6b7280/ffffff?text=Изображение+не+найдено';
                            }}
                        />
                    </div>
                    <div className="md:w-1/2 flex flex-col justify-center">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">{selectedProduct.name}</h2>
                        <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                            {selectedProduct.description}
                        </p>
                        <div className="flex items-center mb-6">
                            <span className="text-4xl font-extrabold text-indigo-700 mr-4">${selectedProduct.price.toFixed(2)}</span>
                        </div>
                        <button
                            onClick={() => addToCart(selectedProduct)}
                            className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-indigo-700 transform hover:scale-105 transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-70 text-lg"
                        >
                            Добавить в Корзину
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProductDetailPage;