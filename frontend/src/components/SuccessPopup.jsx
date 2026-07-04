import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

const SuccessPopup = ({ message, subMessage, onClose, buttonText = 'Continue' }) => {
  const { theme } = useTheme();
  const [showCheck, setShowCheck] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowCheck(true), 300);
  }, []);

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div
        className={`w-full max-w-sm rounded-3xl p-8 text-center animate-scaleIn ${
          theme === 'dark' ? 'bg-[#12122a] border border-gray-800' : 'bg-white shadow-2xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success Animation Circle */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className={`w-full h-full rounded-full flex items-center justify-center transition-all duration-700 ${
            showCheck ? 'bg-green-500 scale-100' : 'bg-green-500/20 scale-50'
          }`}>
            <svg
              className={`w-12 h-12 text-white transition-all duration-500 ${
                showCheck ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          {/* Pulse Ring */}
          {showCheck && (
            <>
              <div className="absolute inset-0 rounded-full bg-green-500/30" style={{ animation: 'pulse-ring 1.5s infinite' }}></div>
              <div className="absolute inset-0 rounded-full bg-green-500/20" style={{ animation: 'pulse-ring 1.5s infinite 0.5s' }}></div>
            </>
          )}
        </div>

        {/* Confetti Dots */}
        <div className="relative">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-float"
              style={{
                background: ['#e94560', '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#9b59b6'][i],
                left: `${15 + i * 14}%`,
                top: `${-20 + (i % 2) * 10}px`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: `${2 + i * 0.3}s`,
              }}
            ></div>
          ))}
        </div>

        <h3 className={`text-2xl font-bold mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          {message}
        </h3>

        {subMessage && (
          <p className={`text-sm mb-6 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {subMessage}
          </p>
        )}

        <button onClick={onClose} className="btn-primary w-full">
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default SuccessPopup;