import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

const InitialLoader = ({ onComplete }) => {
  const { theme } = useTheme();
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const duration = 2500; // 2.5 seconds
    const interval = 30;
    const step = (100 / (duration / interval));

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setFadeOut(true);
            setTimeout(onComplete, 500);
          }, 200);
          return 100;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-500 ${
      fadeOut ? 'opacity-0' : 'opacity-100'
    } ${theme === 'dark' ? 'bg-[#08080a]' : 'bg-white'}`}>

      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 animate-pulse"
          style={{ background: 'radial-gradient(circle, rgba(233,69,96,0.4) 0%, transparent 70%)' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-20 animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)',
            animationDelay: '1s',
          }}></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: theme === 'dark'
          ? 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)'
          : 'linear-gradient(rgba(0,0,0,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.5) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }}></div>

      {/* Center Content */}
      <div className="relative z-10 text-center px-6">

        {/* Logo Animation */}
        <div className="mb-12 relative">
          <div className="inline-flex items-center gap-1 relative">
            <span className="text-4xl md:text-6xl font-black gradient-text animate-fadeInUp"
              style={{ animationDelay: '0s', animationFillMode: 'both' }}>
              THE
            </span>
            <span className={`text-4xl md:text-6xl font-black animate-fadeInUp ${
              theme === 'dark' ? 'text-white' : 'text-black'
            }`}
              style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
              ACCESSORIES
            </span>
            <span className="text-4xl md:text-6xl font-black gradient-text animate-fadeInUp"
              style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
              LAB
            </span>
          </div>

          {/* Glow */}
          <div className="absolute inset-0 blur-3xl opacity-30 bg-gradient-to-r from-primary to-purple-500 -z-10"></div>
        </div>

        {/* Tagline */}
        <p className={`text-sm md:text-base mb-16 tracking-[4px] uppercase font-light animate-fadeInUp ${
          theme === 'dark' ? 'text-white/50' : 'text-black/50'
        }`}
          style={{ animationDelay: '0.6s', animationFillMode: 'both' }}>
          Premium · Elegant · Delivered
        </p>

        {/* Loading Bar */}
        <div className="max-w-xs mx-auto animate-fadeInUp"
          style={{ animationDelay: '0.8s', animationFillMode: 'both' }}>

          {/* Progress Bar */}
          <div className={`relative h-1 rounded-full overflow-hidden ${
            theme === 'dark' ? 'bg-white/10' : 'bg-black/10'
          }`}>
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-full transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
            </div>
          </div>

          {/* Percentage */}
          <div className="flex items-center justify-between mt-3">
            <span className={`text-[10px] tracking-[3px] uppercase font-medium ${
              theme === 'dark' ? 'text-white/40' : 'text-black/40'
            }`}>
              Loading
            </span>
            <span className="text-[10px] tracking-[3px] font-bold gradient-text">
              {Math.floor(progress)}%
            </span>
          </div>
        </div>

        {/* Loading Dots */}
        <div className="mt-12 flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>

      {/* Bottom Text */}
      <div className={`absolute bottom-8 left-0 right-0 text-center animate-fadeInUp ${
        theme === 'dark' ? 'text-white/30' : 'text-black/30'
      }`}
        style={{ animationDelay: '1s', animationFillMode: 'both' }}>
        <p className="text-[10px] uppercase tracking-[6px]">Karachi · Pakistan</p>
      </div>
    </div>
  );
};

export default InitialLoader;