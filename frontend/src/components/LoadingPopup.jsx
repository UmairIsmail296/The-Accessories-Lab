import { useTheme } from '../context/ThemeContext';

const LoadingPopup = ({ message = 'Processing...', subMessage = '' }) => {
  const { theme } = useTheme();

  return (
    <div className="popup-overlay animate-scaleIn">
      <div className={`w-full max-w-sm rounded-3xl p-8 text-center animate-slideUp ${
        theme === 'dark' ? 'bg-[#12122a] border border-gray-800' : 'bg-white shadow-2xl'
      }`}>
        {/* Animated Loader */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          {/* Outer Ring */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
          {/* Middle Ring */}
          <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          {/* Inner Ring */}
          <div className="absolute inset-4 rounded-full border-4 border-transparent border-t-pink-500 animate-spin" style={{ animationDuration: '2s' }}></div>
          {/* Center Dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 bg-primary rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Loading Dots */}
        <div className="mb-4">
          <span className="loading-dot"></span>
          <span className="loading-dot"></span>
          <span className="loading-dot"></span>
        </div>

        <h3 className={`text-xl font-bold mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          {message}
        </h3>

        {subMessage && (
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {subMessage}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingPopup;