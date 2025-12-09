import React, { useState } from 'react';
import mascotImage from '@/assets/mascot.png';

// LINE icon component
const LineIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
  </svg>
);

export const MascotCharacter: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    window.open('https://liff.line.me/1645278921-kWRPP32q/?accountId=026adbfw', '_blank');
  };

  return (
    <div 
      className="fixed bottom-0 right-4 z-50 pointer-events-auto select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Speech bubble */}
      <div 
        className={`absolute bottom-full right-4 mb-2 transition-all duration-300 ${
          isHovered 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        <div className="bg-card rounded-2xl px-4 py-2 shadow-elevated border border-border/50 whitespace-nowrap flex items-center gap-2">
          <LineIcon className="w-4 h-4 text-[#06C755]" />
          <p className="text-sm font-medium text-foreground">聯繫大師姐</p>
        </div>
        {/* Bubble tail */}
        <div className="absolute bottom-0 right-10 translate-y-full">
          <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-card" 
               style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.05))' }} 
          />
        </div>
      </div>

      {/* Mascot image */}
      <div 
        className={`animate-float cursor-pointer transition-transform duration-200 ${
          isHovered ? 'scale-110' : 'scale-100'
        }`}
      >
        <img 
          src={mascotImage} 
          alt="小助手"
          className="w-40 h-auto drop-shadow-xl"
          draggable={false}
        />
      </div>
    </div>
  );
};
