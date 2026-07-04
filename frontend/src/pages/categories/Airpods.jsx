import { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../../components/ProductCard';
import socket from '../../utils/socket';

const Airpods = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();

    socket.on('product_added', (product) => {
      if (product.category === 'airpods') {
        setProducts((prev) => [product, ...prev]);
      }
    });

    socket.on('product_updated', (updatedProduct) => {
      setProducts((prev) =>
        prev.map((p) => (p._id === updatedProduct._id ? updatedProduct : p))
      );
    });

    socket.on('product_deleted', (productId) => {
      setProducts((prev) => prev.filter((p) => p._id !== productId));
    });

    return () => {
      socket.off('product_added');
      socket.off('product_updated');
      socket.off('product_deleted');
    };
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get('/api/products/category/airpods');
      setProducts(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 animate-fadeIn">
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            <span className="text-primary">Airpods</span> & Earbuds
          </h1>
          <p className="text-gray-400 text-lg">Premium Ronin & Zero Wireless Earbuds</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl">No airpods available yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Airpods;