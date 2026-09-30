import React from 'react';

interface EmbossedLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animate?: boolean;
}

export const EmbossedLogo: React.FC<EmbossedLogoProps> = ({
  size = 'md',
  className = '',
  animate = false,
}) => {
  const sizeMap = {
    sm: { dimension: 38, radius: 10, fontSize: 24, strokeWidth: 1 },
    md: { dimension: 52, radius: 14, fontSize: 34, strokeWidth: 1.5 },
    lg: { dimension: 84, radius: 22, fontSize: 54, strokeWidth: 2 },
    xl: { dimension: 112, radius: 30, fontSize: 72, strokeWidth: 2.5 },
  };

  const { dimension, radius, fontSize, strokeWidth } = sizeMap[size];
  const uniqueId = React.useId().replace(/:/g, '');

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${
        animate ? 'transition-transform duration-300 hover:scale-105 active:scale-95' : ''
      } ${className}`}
      style={{ width: dimension, height: dimension }}
    >
      <svg
        width={dimension}
        height={dimension}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.85)]"
      >
        <defs>
          {/* Deep Matte Base Gradient */}
          <linearGradient id={`bg_${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e222b" />
            <stop offset="45%" stopColor="#13161c" />
            <stop offset="100%" stopColor="#080a0d" />
          </linearGradient>

          {/* Inner Matte Plate Gradient */}
          <linearGradient id={`innerPlate_${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#14171e" />
            <stop offset="100%" stopColor="#0a0c10" />
          </linearGradient>

          {/* Embossed Metallic P Gradient */}
          <linearGradient id={`pGrad_${uniqueId}`} x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#e5e7eb" />
            <stop offset="60%" stopColor="#9ca3af" />
            <stop offset="85%" stopColor="#4b5563" />
            <stop offset="100%" stopColor="#1f2937" />
          </linearGradient>

          {/* Subtle Accent Glow Ring */}
          <linearGradient id={`borderGrad_${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.28)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.06)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.8)" />
          </linearGradient>

          {/* 3D Emboss Filter for the slanted P */}
          <filter id={`embossFilter_${uniqueId}`} x="-30%" y="-30%" width="160%" height="160%">
            {/* Top-left light catch */}
            <feDropShadow dx="-1.2" dy="-1.5" stdDeviation="0.8" floodColor="#ffffff" floodOpacity="0.38" />
            {/* Bottom-right deep drop shadow for tactile depth */}
            <feDropShadow dx="2.8" dy="3.5" stdDeviation="2.2" floodColor="#000000" floodOpacity="0.95" />
          </filter>

          {/* Bevel rim shadow */}
          <filter id={`rimShadow_${uniqueId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity="0.9" />
          </filter>
        </defs>

        {/* Outer Matte Tile */}
        <rect
          x="4"
          y="4"
          width="92"
          height="92"
          rx={radius * (100 / dimension)}
          fill={`url(#bg_${uniqueId})`}
          stroke={`url(#borderGrad_${uniqueId})`}
          strokeWidth={strokeWidth * (100 / dimension)}
          filter={`url(#rimShadow_${uniqueId})`}
        />

        {/* Recessed Inner Rim */}
        <rect
          x="10"
          y="10"
          width="80"
          height="80"
          rx={(radius - 4) * (100 / dimension)}
          fill={`url(#innerPlate_${uniqueId})`}
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth="1"
        />

        {/* Slanted Embossed Letter P */}
        <g transform="skewX(-11) translate(10, 0)">
          <text
            x="48"
            y="70"
            fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
            fontSize="62"
            fontWeight="900"
            fontStyle="italic"
            textAnchor="middle"
            fill={`url(#pGrad_${uniqueId})`}
            filter={`url(#embossFilter_${uniqueId})`}
            letterSpacing="-1"
          >
            P
          </text>
        </g>
      </svg>
    </div>
  );
};
