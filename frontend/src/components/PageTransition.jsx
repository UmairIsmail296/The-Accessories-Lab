import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const { theme } = useTheme();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('fadeIn');
  const [isFirstRender, setIsFirstRender] = useState(true);

  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
      return;
    }

    if (location.pathname !== displayLocation.pathname) {
      setTransitionStage('fadeOut');
    }
  }, [location, displayLocation, isFirstRender]);

  const handleTransitionEnd = () => {
    if (transitionStage === 'fadeOut') {
      setDisplayLocation(location);
      window.scrollTo(0, 0);
      setTimeout(() => setTransitionStage('fadeIn'), 50);
    }
  };

  return (
    <>
      {/* Transition Overlay */}
      {transitionStage === 'fadeOut' && (
        <div className={`fixed inset-0 z-[9998] pointer-events-none flex items-center justify-center ${
          theme === 'dark' ? 'bg-[#08080a]' : 'bg-white'
        } animate-transitionSlide`}>
          <div className="text-center">
            <div className="flex items-center gap-2 mb-4 justify-center">
              <div className="w-2 h-8 bg-primary animate-pulse"></div>
              <div className="w-2 h-8 bg-purple-500 animate-pulse" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-8 bg-pink-500 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <p className={`text-[10px] tracking-[6px] uppercase ${
              theme === 'dark' ? 'text-white/40' : 'text-black/40'
            }`}>Loading</p>
          </div>
        </div>
      )}

      {/* Page Content with Animation */}
      <div
        className={`transition-all duration-500 ease-out ${
          transitionStage === 'fadeOut'
            ? 'opacity-0 translate-y-4 scale-[0.99]'
            : 'opacity-100 translate-y-0 scale-100'
        }`}
        onTransitionEnd={handleTransitionEnd}
      >
        {children}
      </div>
    </>
  );
};

export default PageTransition;