import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getImageUrl } from '../utils/imageHelper';
import LoadingPopup from '../components/LoadingPopup';
import SuccessPopup from '../components/SuccessPopup';
import toast from 'react-hot-toast';
import socket from '../utils/socket';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();
  const { theme } = useTheme();

  const [formData, setFormData] = useState({ rating: 5, title: '', comment: '' });

  useEffect(() => {
    fetchReviews();
    socket.on('new_review', (review) => {
      setReviews((prev) => [review, ...prev]);
    });
    return () => { socket.off('new_review'); };
  }, []);

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get('/api/reviews');
      setReviews(data);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to write a review'); return; }
    setSubmitting(true);
    try {
      await axios.post('/api/reviews', formData, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setSubmitting(false);
      setShowSuccess(true);
      setFormData({ rating: 5, title: '', comment: '' });
      setShowForm(false);
    } catch (error) {
      setSubmitting(false);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={`text-lg ${i < rating ? 'text-yellow-400' : theme === 'dark' ? 'text-gray-700' : 'text-gray-300'}`}>★</span>
    ));
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="page-container">
      {submitting && <LoadingPopup message="Submitting Review..." />}
      {showSuccess && (
        <SuccessPopup message="Review Submitted! 🌟" subMessage="Thank you for your feedback!" buttonText="Done" onClose={() => setShowSuccess(false)} />
      )}

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 animate-fadeInDown">
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            <span className="gradient-text">Customer</span>{' '}
            <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Reviews</span>
          </h1>

          <div className={`inline-flex items-center gap-4 rounded-2xl px-8 py-4 mt-4 ${
            theme === 'dark' ? 'bg-[#12122a] border border-gray-800' : 'bg-white shadow-lg border border-gray-100'
          }`}>
            <span className="text-4xl font-black gradient-text">{averageRating}</span>
            <div>
              <div className="flex">{renderStars(Math.round(averageRating))}</div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{reviews.length} reviews</p>
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <button onClick={() => {
            if (!user) { toast.error('Please login to write a review'); return; }
            setShowForm(!showForm);
          }} className="btn-primary text-lg">
            {showForm ? 'Cancel' : 'Write a Review'}
          </button>
        </div>

        {showForm && (
          <div className={`rounded-2xl p-6 md:p-8 mb-8 animate-fadeInUp ${
            theme === 'dark' ? 'bg-[#12122a] border border-gray-800' : 'bg-white shadow-lg border border-gray-100'
          }`}>
            <h3 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Share Your Experience</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className={`block text-sm font-bold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setFormData({ ...formData, rating: star })}
                      className={`text-3xl transition-all duration-200 hover:scale-125 ${star <= formData.rating ? 'text-yellow-400' : theme === 'dark' ? 'text-gray-700' : 'text-gray-300'}`}
                    >★</button>
                  ))}
                </div>
              </div>

              <div>
                <label className={`block text-sm font-bold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Title</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field" placeholder="e.g., Amazing quality!" required />
              </div>

              <div>
                <label className={`block text-sm font-bold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Your Review</label>
                <textarea value={formData.comment} onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  className="input-field h-32 resize-none" placeholder="Tell us about your experience..." required />
              </div>

              <button type="submit" className="btn-primary w-full">Submit Review</button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
            </div>
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-4 stagger-children">
            {reviews.map((review) => (
              <div key={review._id} className={`rounded-2xl p-6 opacity-0 animate-fadeInUp hover-lift ${
                theme === 'dark' ? 'bg-[#12122a] border border-gray-800' : 'bg-white shadow-md border border-gray-100'
              }`}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 overflow-hidden">
                    {review.userProfilePic ? (
                      <img src={getImageUrl(review.userProfilePic)} alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                    ) : null}
                    <span style={{ display: review.userProfilePic ? 'none' : 'flex' }} className="w-full h-full items-center justify-center">
                      {review.userName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{review.userName}</h4>
                      <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                        {new Date(review.createdAt).toLocaleDateString('en-PK')}
                      </span>
                    </div>
                    <div className="flex mb-2">{renderStars(review.rating)}</div>
                    <h5 className={`font-semibold mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{review.title}</h5>
                    <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{review.comment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📝</p>
            <p className={`text-xl ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No reviews yet. Be the first!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;