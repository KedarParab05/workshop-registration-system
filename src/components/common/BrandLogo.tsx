import React from 'react';

export const KAUSHALYA_LOGO_URL =
  'https://res.cloudinary.com/dr59elrhw/image/upload/v1794634835/kessknblaoupdmy9wqgv.png';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
  onClick?: () => void;
  inverseText?: boolean; // For dark backgrounds like footer
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showTagline = true,
  className = '',
  onClick,
  inverseText = false,
}) => {
  // Sizing definitions
  const dimensions = {
    sm: {
      img: 'w-8 h-8 sm:w-9 sm:h-9',
      name: 'text-base sm:text-lg',
      tagline: 'text-[8px] sm:text-[9px] tracking-[0.14em]',
      gap: 'gap-2 sm:gap-2.5',
    },
    md: {
      img: 'w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12',
      name: 'text-lg sm:text-xl lg:text-2xl',
      tagline: 'text-[8.5px] sm:text-[9.5px] lg:text-[10px] tracking-[0.18em]',
      gap: 'gap-2.5 sm:gap-3',
    },
    lg: {
      img: 'w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16',
      name: 'text-2xl sm:text-3xl lg:text-4xl',
      tagline: 'text-[10px] sm:text-[11px] lg:text-[12px] tracking-[0.2em]',
      gap: 'gap-3 sm:gap-3.5',
    },
  }[size];

  const content = (
    <div className={`flex items-center ${dimensions.gap} ${className}`}>
      {/* Approved Kaushalya Mobile Logo Emblem */}
      <img
        src={KAUSHALYA_LOGO_URL}
        alt="Kaushalya"
        className={`${dimensions.img} object-contain shrink-0`}
        loading="eager"
      />

      {/* Brand Identity Typography */}
      <div className="flex flex-col justify-center text-left">
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`font-heading font-extrabold ${dimensions.name} tracking-tight ${
              inverseText
                ? 'text-white'
                : 'text-[#101410] dark:text-[#f0f5ee]'
            }`}
          >
            Kaushalya
          </span>
        </div>
        {showTagline && (
          <span
            className={`font-sans font-bold uppercase leading-none mt-1 ${dimensions.tagline} ${
              inverseText
                ? 'text-[#DAE7C7]'
                : 'text-[#08482D] dark:text-[#DAE7C7]'
            }`}
          >
            LEARN. BUILD. GROW.
          </span>
        )}
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex items-center text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#08482D] rounded-xl group transition-transform active:scale-95 cursor-pointer"
        aria-label="Kaushalya Brand Home"
      >
        {content}
      </button>
    );
  }

  return content;
};
