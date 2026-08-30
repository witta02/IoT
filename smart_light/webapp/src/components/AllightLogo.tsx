import React, { useState } from 'react';

interface AllightLogoProps {
  size?: number;
  className?: string;
  interactive?: boolean;
}

export const AllightLogo: React.FC<AllightLogoProps> = ({
  size = 40,
  className = '',
  interactive = true
}) => {
  const [isInverted, setIsInverted] = useState(false);

  return (
    <div 
      className={`inline-flex items-center justify-center select-none ${interactive ? 'cursor-pointer' : ''} ${className}`}
      onClick={() => interactive && setIsInverted(!isInverted)}
      title={interactive ? 'คลิกเพื่อหมุนสลับ โคมไฟ <-> ตัวอักษร A' : 'All Light logo'}
      style={{ width: size, height: size }}
    >
      <svg 
        viewBox="0 0 100 100" 
        width="100%" 
        height="100%" 
        className="transition-transform duration-500 ease-spring"
        style={{ transform: isInverted ? 'rotate(180deg)' : 'rotate(0deg)' }}
      >
        <defs>
          {/* Inner Light Glow Gradient */}
          <radialGradient id="allight-bulb-glow" cx="50%" cy="40%" r="45%">
            <stop offset="0%" stop-color="#fffef0" stop-opacity="1" />
            <stop offset="35%" stop-color="#fef08a" stop-opacity="0.8" />
            <stop offset="70%" stop-color="#d4af37" stop-opacity="0.25" />
            <stop offset="100%" stop-color="#d4af37" stop-opacity="0" />
          </radialGradient>

          {/* Golden Stroke Gradient */}
          <linearGradient id="allight-stroke" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#fef08a" />
            <stop offset="70%" stop-color="#d4af37" />
            <stop offset="100%" stop-color="#b45309" />
          </linearGradient>

          {/* Soft Bloom Filter */}
          <filter id="allight-bloom" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ambient Inner Illumination */}
        <path
          d="M 50 14 C 28 14, 24 38, 33 58 L 50 82 L 67 58 C 76 38, 72 14, 50 14 Z"
          fill="url(#allight-bulb-glow)"
        />

        {/* Outer Teardrop Bulb + Inverted A Contour */}
        <path
          d="M 50 14 C 26 14, 22 40, 32 62 L 50 88 L 68 62 C 78 40, 74 14, 50 14 Z"
          fill="none"
          stroke="url(#allight-stroke)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Crossbar (Letter A crossbar when upside down / Base separator when upright) */}
        <line
          x1="32"
          y1="62"
          x2="68"
          y2="62"
          stroke="url(#allight-stroke)"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Center Radiant Light Core Point */}
        <circle
          cx="50"
          cy="38"
          r="4.5"
          fill="#ffffff"
          filter="url(#allight-bloom)"
        />
      </svg>
    </div>
  );
};
