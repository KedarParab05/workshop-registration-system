import React from 'react';

export const KAUSHALYA_LOGO_URL =
  'https://res.cloudinary.com/dr59elrhw/image/upload/v1794634835/kessknblaoupdmy9wqgv.png';

export const KAUSHALYA_DESKTOP_LOGO_URL =
  'https://res.cloudinary.com/dr59elrhw/image/upload/v1794634775/r8u6zhsvotsychqo4h6h.png';

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
      tagline: 'text-[7.5px] sm:text-[8.5px] tracking-[0.14em]',
      gap: 'gap-2 sm:gap-2.5',
    },
    md: {
      img: 'w-10 h-10 sm:w-11 sm:h-11',
      name: 'text-lg sm:text-xl lg:text-[22px]',
      tagline: 'text-[8px] sm:text-[9px] lg:text-[9.5px] tracking-[0.16em]',
      gap: 'gap-2.5 sm:gap-3',
    },
    lg: {
      img: 'w-12 h-12 sm:w-14 sm:h-14',
      name: 'text-2xl sm:text-3xl',
      tagline: 'text-[9.5px] sm:text-[11px] tracking-[0.18em]',
      gap: 'gap-3 sm:gap-3.5',
    },
  }[size];

  const content = (
    <div className={`flex items-center ${dimensions.gap} shrink-0 select-none ${className}`}>
      {/* Vertically Centered Kaushalya Logo Emblem */}
      <img
        src={KAUSHALYA_LOGO_URL}
        alt="Kaushalya"
        className={`${dimensions.img} object-contain shrink-0 aspect-square`}
        loading="eager"
      />

      {/* Brand Identity Typography Lockup */}
      <div className="flex flex-col justify-center text-left shrink-0">
        <span
          className={`font-heading font-extrabold ${dimensions.name} tracking-tight leading-none whitespace-nowrap ${
            inverseText
              ? 'text-white'
              : 'text-[#101410] dark:text-[#f0f5ee]'
          }`}
        >
          Kaushalya
        </span>
        {showTagline && (
          <span
            className={`font-sans font-bold uppercase leading-none mt-1 sm:mt-1.5 ${dimensions.tagline} whitespace-nowrap ${
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
        className="flex items-center text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#08482D] rounded-2xl group transition-transform active:scale-95 cursor-pointer shrink-0"
        aria-label="Kaushalya Brand Home"
      >
        {content}
      </button>
    );
  }

  return content;
};
