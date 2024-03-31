import React, { useState, useEffect } from 'react';
import { FaFilter, FaSort } from 'react-icons/fa';

interface Product {
  id: number;
  name: string;
  image: string;
  price: number;
}

const mockProducts: Product[] = [
  {
    id: 1,
    name: 'Floral Print Dress',
    image: 'https://example.com/images/dress1.jpg',
    price: 49.99,
  },
  {
    id: 2,
    name: 'Denim Jacket',
    image: 'https://example.com/images/jacket1.jpg',
    price: 79.99,
  },
  {
    id: 3,
    name: 'Striped T-Shirt',
    image: 'https://example.com/images/tshirt1.jpg',
    price: 24.99,
  },
  {
    id: 4,
    name: 'Leather Handbag',
    image: 'https://example.com/images/handbag1.jpg',
    price: 129.99,
  },
  {
    id: 5,
    name: 'Skinny Jeans',
    image: 'https://example.com/images/jeans1.jpg',
    price: 59.99,
  },
  {
    id: 6,
    name: 'Ankle Boots',
    image: 'https://example.com/images/boots1.jpg',
    price: 89.99,
  },
];

const CategoryPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('');

  useEffect(() => {
    // Simulated API call to fetch products based on the selected category
    const fetchProducts = async () => {
      // Replace this with your actual API call
      setProducts(mockProducts);
    };

    fetchProducts();
  }, []);

  const handleFilterChange = (filter: string) => {
    const updatedFilters = selectedFilters.includes(filter)
      ? selectedFilters.filter((f) => f !== filter)
      : [...selectedFilters, filter];
    setSelectedFilters(updatedFilters);
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(event.target.value);
  };

  // Apply filters and sorting to the products
  const filteredProducts = products
    .filter((product) => {
      // Apply your filtering logic here based on selectedFilters
      return true;
    })
    .sort((a, b) => {
      // Apply your sorting logic here based on sortBy
      return 0;
    });

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='mb-8 text-3xl font-bold text-gray-800'>Category Name</h1>
      <div className='mb-8 flex justify-between'>
        <div className='flex items-center'>
          <FaFilter className='mr-2 text-gray-500' />
          <span className='font-semibold text-gray-700'>Filters:</span>
          <div className='ml-4'>
            <label className='mr-4 inline-flex items-center'>
              <input
                type='checkbox'
                className='form-checkbox h-5 w-5 text-blue-600'
                checked={selectedFilters.includes('filter1')}
                onChange={() => handleFilterChange('filter1')}
              />
              <span className='ml-2 text-gray-700'>Filter 1</span>
            </label>
            {/* Add more filter options */}
          </div>
        </div>
        <div className='flex items-center'>
          <FaSort className='mr-2 text-gray-500' />
          <span className='font-semibold text-gray-700'>Sort by:</span>
          <select
            className='ml-4 rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            value={sortBy}
            onChange={handleSortChange}
          >
            <option value=''>None</option>
            <option value='price-asc'>Price: Low to High</option>
            <option value='price-desc'>Price: High to Low</option>
            {/* Add more sorting options */}
          </select>
        </div>
      </div>
      <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className='overflow-hidden rounded-lg bg-white shadow'
          >
            <img
              src={product.image}
              alt={product.name}
              className='h-64 w-full object-cover'
            />
            <div className='p-4'>
              <h3 className='text-xl font-semibold text-gray-800'>
                {product.name}
              </h3>
              <p className='mt-2 font-semibold text-gray-600'>
                ${product.price.toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;
