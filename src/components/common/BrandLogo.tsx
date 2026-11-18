import React from 'react';
import { GraduationCap } from 'lucide-react';

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
  const dimensions = {
    sm: {
      box: 'w-8 h-8 sm:w-9 sm:h-9',
      icon: 'w-4 h-4 sm:w-5 sm:h-5',
      name: 'text-base sm:text-lg',
      tagline: 'text-[7.5px] sm:text-[8.5px] tracking-[0.14em]',
      gap: 'gap-2 sm:gap-2.5',
    },
    md: {
      box: 'w-10 h-10 sm:w-11 sm:h-11',
      icon: 'w-5 h-5 sm:w-6 sm:h-6',
      name: 'text-lg sm:text-xl lg:text-[22px]',
      tagline: 'text-[8px] sm:text-[9px] lg:text-[9.5px] tracking-[0.16em]',
      gap: 'gap-2.5 sm:gap-3',
    },
    lg: {
      box: 'w-12 h-12 sm:w-14 sm:h-14',
      icon: 'w-6 h-6 sm:w-7 sm:h-7',
      name: 'text-2xl sm:text-3xl',
      tagline: 'text-[9.5px] sm:text-[11px] tracking-[0.18em]',
      gap: 'gap-3 sm:gap-3.5',
    },
  }[size];

  const content = (
    <div className={`flex items-center ${dimensions.gap} shrink-0 select-none ${className}`}>
      {/* Orange square with white graduation cap and 2px border */}
      <div
        className={`${dimensions.box} bg-[#F4511E] border-2 border-[#101D32] rounded-xl flex items-center justify-center text-white shadow-[2px_2px_0px_0px_#101D32] shrink-0`}
      >
        <GraduationCap className={`${dimensions.icon} text-white stroke-[2.2]`} />
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col justify-center text-left shrink-0">
        <span
          className={`font-heading font-extrabold ${dimensions.name} tracking-tight leading-none whitespace-nowrap ${
            inverseText ? 'text-white' : 'text-[#101D32]'
          }`}
        >
          Kaushalya
        </span>
        {showTagline && (
          <span
            className={`font-sans font-bold uppercase leading-none mt-1 sm:mt-1.5 ${dimensions.tagline} whitespace-nowrap ${
              inverseText ? 'text-[#FFD6B0]' : 'text-[#F4511E]'
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
        className="flex items-center text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4511E] rounded-xl group transition-transform active:scale-95 cursor-pointer shrink-0"
        aria-label="Kaushalya Brand Home"
      >
        {content}
      </button>
    );
  }

  return content;
};
