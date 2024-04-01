'use client';
import { useState } from 'react';

const products = [
  { id: 1, name: 'Product 1', price: 19.99, category: 'Tops' },
  { id: 2, name: 'Product 2', price: 24.99, category: 'Dresses' },
  { id: 3, name: 'Product 3', price: 29.99, category: 'Bottoms' },
  { id: 4, name: 'Product 4', price: 34.99, category: 'Dresses' },
  { id: 5, name: 'Product 5', price: 39.99, category: 'Tops' },
  { id: 6, name: 'Product 6', price: 44.99, category: 'Bottoms' },
  // Add more products as needed
];

const categories = ['All', 'Tops', 'Dresses', 'Bottoms'];

export default function ProductCatalog() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredProducts =
    selectedCategory === 'All'
      ? products
      : products.filter((product) => product.category === selectedCategory);

  return (
    <div className='container mx-auto py-8'>
      <h1 className='mb-8 text-4xl font-bold'>Product Catalog</h1>

      <div className='mb-8 flex space-x-4'>
        {categories.map((category) => (
          <button
            key={category}
            className={`rounded-md px-4 py-2 font-semibold ${
              selectedCategory === category
                ? 'bg-gray-800 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
        {filteredProducts.map((product) => (
          <div key={product.id} className='rounded-md bg-white p-4 shadow-md'>
            <div className='mb-4 h-48 w-full bg-gray-200'></div>
            <h2 className='mb-2 text-xl font-semibold'>{product.name}</h2>
            <p className='mb-4 text-gray-600'>${product.price}</p>
            <button className='rounded-md bg-blue-500 px-4 py-2 text-white'>
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
