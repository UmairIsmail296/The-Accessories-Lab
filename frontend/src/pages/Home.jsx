import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { useTheme } from '../context/ThemeContext';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { getImageUrl } from '../utils/imageHelper';
import socket from '../utils/socket';

const categories = [
  { name: 'Airpods', path: '/airpods', desc: 'Ronin & Zero Earbuds', emoji: '🎧' },
  { name: 'Handfree', path: '/handfree', desc: 'Wired & Wireless', emoji: '🎵' },
  { name: 'Back Covers', path: '/mobile-back-covers', desc: 'Stylish Cases', emoji: '📱' },
  { name: 'Adapters', path: '/adapters', desc: 'Fast Charging', emoji: '🔌' },
  { name: 'Charging Leads', path: '/charging-leads', desc: 'Premium Cables', emoji: '⚡' },
  { name: 'Cooling Fans', path: '/cooling-fans', desc: 'Latest Models', emoji: '❄️' },
  { name: 'Splitters', path: '/splitters', desc: 'Audio Splitters', emoji: '🔀' },
  { name: 'Connectors', path: '/connectors', desc: 'All Types', emoji: '🔗' },
  { name: 'Smart Watches', path: '/mobile-watch', desc: 'Ronin & Zero', emoji: '⌚' },
  { name: 'Headphones', path: '/headphones', desc: 'Over-Ear', emoji: '🎧' },
  { name: 'Speakers', path: '/speakers', desc: 'Portable', emoji: '🔊' },
  { name: 'Powerbank', path: '/powerbank', desc: 'High Capacity', emoji: '🔋' },
];

// Reviews Section Component
const HomeReviews = ({ theme }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ref, isVisible] = useScrollReveal({ threshold: 0.1 });

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await axios.get('/api/reviews');
        setReviews(data.slice(0, 6));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchReviews();

    socket.on('new_review', (review) => {
      setReviews((prev) => [review, ...prev].slice(0, 6));
    });

    return () => socket.off('new_review');
  }, []);

  if (loading) return null;

  if (reviews.length === 0) {
    return (
      <div ref={ref} className={`text-center py-10 transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        <p className="text-5xl mb-4">⭐</p>
        <p className={`text-lg mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          No reviews yet. Be the first to share your experience!
        </p>
        <Link to="/reviews" className="btn-primary">Write a Review</Link>
      </div>
    );
  }

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={`text-sm ${i < rating ? 'text-yellow-400' : theme === 'dark' ? 'text-gray-700' : 'text-gray-300'}`}>★</span>
    ));
  };

  return (
    <div ref={ref}>
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-all duration-1000 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}>
        {reviews.map((review, index) => (
          <div key={review._id}
            className={`card-style p-5 hover-lift transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{ transitionDelay: `${index * 100}ms` }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
                {review.userProfilePic ? (
                  <img
                    src={getImageUrl(review.userProfilePic)}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                ) : null}
                <span style={{ display: review.userProfilePic ? 'none' : 'flex' }} className="w-full h-full items-center justify-center">
                  {review.userName?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-sm truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{review.userName}</p>
                <div className="flex">{renderStars(review.rating)}</div>
              </div>
            </div>
            <h4 className={`font-semibold text-sm mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{review.title}</h4>
            <p className={`text-xs line-clamp-3 leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{review.comment}</p>
            <p className={`text-[10px] mt-3 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>
              {new Date(review.createdAt).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })}
            </p>
          </div>
        ))}
      </div>

      <div className="text-center mt-8">
        <Link to="/reviews" className="btn-outline text-lg">View All Reviews</Link>
      </div>
    </div>
  );
};

// Categories Section
const CategoriesSection = ({ theme }) => {
  const [ref, isVisible] = useScrollReveal({ threshold: 0.1 });

  return (
    <section ref={ref} className="max-w-7xl mx-auto px-4 py-16">
      <h2 className={`section-title transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        <span className="gradient-text">Browse</span>{' '}
        <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Categories</span>
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((cat, index) => (
          <Link
            key={cat.path}
            to={cat.path}
            className={`card-style p-5 text-center group hover-lift transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            } ${
              theme === 'dark' ? 'hover:border-primary/30' : 'hover:shadow-lg'
            }`}
            style={{ transitionDelay: `${index * 50}ms` }}
          >
            <span className="text-3xl block mb-2 group-hover:animate-bounce-soft">{cat.emoji}</span>
            <h3 className={`font-bold text-sm md:text-base group-hover:text-primary transition-colors ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>{cat.name}</h3>
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{cat.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
};

// Brands Section
const BrandsSection = ({ theme }) => {
  const [ref, isVisible] = useScrollReveal({ threshold: 0.1 });
  const brands = [
    { name: 'RONIN', sub: 'Premium Quality' },
    { name: 'ZERO', sub: 'Lifestyle Tech' },
    { name: 'ACCESSORIES HUB', sub: 'Best Deals' },
  ];

  return (
    <section ref={ref} className={`py-16 ${theme === 'dark' ? 'bg-[#0d0d1a]' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4">
        <h2 className={`section-title transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <span className="gradient-text">Trusted</span>{' '}
          <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Brands</span>
        </h2>
        <div className="flex flex-wrap justify-center gap-6">
          {brands.map((brand, index) => (
            <div
              key={brand.name}
              className={`rounded-2xl p-8 text-center min-w-[200px] hover-lift transition-all duration-700 neon-glow ${
                isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'
              } ${
                theme === 'dark'
                  ? 'bg-[#12122a] border border-gray-800'
                  : 'bg-gray-50 border border-gray-100 shadow-md'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <h3 className="text-2xl font-black gradient-text">{brand.name}</h3>
              <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{brand.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const [productsRef, productsVisible] = useScrollReveal({ threshold: 0.1 });

  useEffect(() => {
    fetchProducts();

    socket.on('product_added', (product) => {
      setFeaturedProducts((prev) => [product, ...prev].slice(0, 8));
    });
    socket.on('product_updated', (updatedProduct) => {
      setFeaturedProducts((prev) =>
        prev.map((p) => (p._id === updatedProduct._id ? updatedProduct : p))
      );
    });
    socket.on('product_deleted', (productId) => {
      setFeaturedProducts((prev) => prev.filter((p) => p._id !== productId));
    });

    return () => {
      socket.off('product_added');
      socket.off('product_updated');
      socket.off('product_deleted');
    };
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get('/api/products');
      setFeaturedProducts(data.slice(0, 8));
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0a0a0f]' : 'bg-[#f5f5f7]'}`}>
      {/* Hero */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0">
          <div className={`absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl animate-pulse ${
            theme === 'dark' ? 'bg-primary/10' : 'bg-primary/5'
          }`}></div>
          <div className={`absolute bottom-10 right-10 w-96 h-96 rounded-full blur-3xl animate-pulse ${
            theme === 'dark' ? 'bg-purple-600/10' : 'bg-purple-400/5'
          }`} style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 pt-20 pb-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-8xl font-black mb-6 animate-fadeInDown">
              <span className="gradient-text">THE</span>{' '}
              <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>ACCESSORIES</span>
              <br />
              <span className="gradient-text animate-float inline-block">LAB</span>
            </h1>
            <p className={`text-lg md:text-2xl mb-10 max-w-2xl mx-auto animate-fadeInUp ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`} style={{ animationDelay: '0.2s' }}>
              Premium Accessories from{' '}
              <span className="text-primary font-black">RONIN</span> &{' '}
              <span className="text-primary font-black">ZERO</span>
              <br />
              <span className="text-sm">Delivered Across Pakistan</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
              <Link to="/airpods" className="btn-primary text-lg py-4 px-10">Shop Now</Link>
              <Link to="/mobile-watch" className="btn-outline text-lg py-4 px-10">View Watches</Link>
            </div>
            <p className={`mt-8 text-sm animate-fadeInUp ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
            }`} style={{ animationDelay: '0.6s' }}>
              🚚 Delivery Charges: Rs. 700 (All Pakistan)
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <CategoriesSection theme={theme} />

      {/* Featured Products */}
      <section ref={productsRef} className="max-w-7xl mx-auto px-4 py-16">
        <h2 className={`section-title transition-all duration-1000 ${
          productsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <span className="gradient-text">Featured</span>{' '}
          <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Products</span>
        </h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" style={{ animationDirection: 'reverse' }}></div>
            </div>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Loading products...</p>
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <div key={product._id}
                className={`transition-all duration-700 ${
                  productsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 animate-fadeInUp">
            <p className="text-6xl mb-4">📦</p>
            <p className={`text-xl ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              No products available yet. Check back soon!
            </p>
          </div>
        )}
      </section>

      {/* Brands */}
      <BrandsSection theme={theme} />

      {/* Reviews */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="section-title animate-fadeInUp">
          <span className="gradient-text">What Customers</span>{' '}
          <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Say</span>
        </h2>
        <HomeReviews theme={theme} />
      </section>

      {/* CTA */}
      <section className={`py-16 ${theme === 'dark' ? 'bg-[#0d0d1a]' : 'bg-white'}`}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4 animate-fadeInUp">
            <span className="gradient-text">Need Help?</span>{' '}
            <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>We're Here!</span>
          </h2>
          <p className={`text-lg mb-8 animate-fadeInUp ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} style={{ animationDelay: '0.2s' }}>
            Have questions, complaints, or suggestions? Reach out to us!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
            <Link to="/contact" className="btn-primary text-lg px-8 py-4">💬 Contact Us</Link>
            <a href="https://wa.me/923427600786?text=Hello!%20I%20need%20help%20with%20THE%20ACCESSORIES%20LAB."
              target="_blank" rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 inline-flex items-center justify-center gap-2 text-lg">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;