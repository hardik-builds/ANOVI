import React from 'react';

interface LogoProps {
  className?: string;
  color?: string;
  showTagline?: boolean;
  tagline?: string;
  framed?: boolean;
  align?: 'center' | 'left';
}

export const Logo: React.FC<LogoProps> = ({ 
  className = "h-8", 
  color = "currentColor",
  showTagline = true,
  tagline = "Haute Joaillerie",
  framed = false,
  align = "center"
}) => {
  return (
    <div 
      className={`inline-flex items-center gap-3 select-none transition-all duration-300 ${
        framed 
          ? 'px-3.5 py-1.5 border border-gold/30 hover:border-gold/60 bg-black/20 backdrop-blur-xs' 
          : ''
      } ${className}`}
    >
      {/* Gemological Diamond Crest with Optical Bounding Box */}
      <svg 
        viewBox="0 0 32 36" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto aspect-[32/36] flex-shrink-0"
        aria-hidden="true"
      >
        {/* Crown Table & Outer Contour */}
        <path 
          d="M16 2L28 11L16 34L4 11L16 2Z" 
          stroke={color} 
          strokeWidth="1.2" 
          strokeLinejoin="round"
        />
        {/* Girdle Line */}
        <line 
          x1="4" 
          y1="11" 
          x2="28" 
          y2="11" 
          stroke={color} 
          strokeWidth="1" 
          strokeOpacity="0.8"
        />
        {/* Table Crown Facets */}
        <polygon 
          points="10,6 22,6 28,11 4,11" 
          stroke={color} 
          strokeWidth="0.8" 
          strokeOpacity="0.5"
          fill="none"
        />
        {/* Star & Kite Facets */}
        <line 
          x1="16" 
          y1="2" 
          x2="16" 
          y2="11" 
          stroke={color} 
          strokeWidth="0.8" 
          strokeOpacity="0.7"
        />
        {/* Central Pavilion Keel Line */}
        <line 
          x1="16" 
          y1="11" 
          x2="16" 
          y2="34" 
          stroke={color} 
          strokeWidth="0.9" 
          strokeOpacity="0.6"
        />
        {/* Pavilion Side Facets */}
        <line 
          x1="10" 
          y1="11" 
          x2="16" 
          y2="28" 
          stroke={color} 
          strokeWidth="0.7" 
          strokeOpacity="0.4"
        />
        <line 
          x1="22" 
          y1="11" 
          x2="16" 
          y2="28" 
          stroke={color} 
          strokeWidth="0.7" 
          strokeOpacity="0.4"
        />
      </svg>

      {/* Brand Wordmark & Descriptor - Optically Centered */}
      <div 
        className={`flex flex-col justify-center leading-none ${
          align === 'center' ? 'items-center text-center' : 'items-start text-left'
        }`}
      >
        <span 
          className={`font-serif tracking-[0.28em] -mr-[0.28em] uppercase text-lg md:text-xl font-normal text-current leading-none inline-block ${
            align === 'center' ? 'text-center' : 'text-left'
          }`}
        >
          ANOVI
        </span>
        {showTagline && (
          <span 
            className={`text-[7px] md:text-[8px] tracking-[0.35em] -mr-[0.35em] uppercase font-sans font-medium opacity-65 mt-1 leading-none text-current inline-block ${
              align === 'center' ? 'text-center' : 'text-left'
            }`}
          >
            {tagline}
          </span>
        )}
      </div>
    </div>
  );
};
