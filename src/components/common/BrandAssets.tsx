import React, { useState } from 'react';

export const BrandLogo: React.FC<{ compact?: boolean; className?: string }> = ({
  compact = false,
  className = '',
}) => (
  <div className={`inline-flex items-center gap-2 select-none ${className}`}>
    <span
      className={`rounded-xl bg-[#0d5c63] text-white font-black flex items-center justify-center shrink-0 shadow-sm ${
        compact ? 'w-7 h-7 text-[11px]' : 'w-8 h-8 md:w-9 md:h-9 text-[13px]'
      }`}
    >
      CM
    </span>
    <div className="flex flex-col items-start leading-none">
      <span
        className={`font-black tracking-[0.18em] text-[#e05a47] ${
          compact ? 'text-[8px]' : 'text-[9px]'
        }`}
      >
        CRAB MASTER
      </span>
      <span
        className={`font-black tracking-[-0.04em] text-[#0d5c63] ${
          compact ? 'text-[20px] -mt-0.5' : 'text-[23px] md:text-[26px] -mt-0.5'
        }`}
      >
        크랩마스터
      </span>
    </div>
  </div>
);

export const KakaoBubbleIcon: React.FC<{ size?: number }> = ({ size = 22 }) => (
  <span
    style={{ width: size, height: size }}
    className="inline-flex items-center justify-center rounded-[7px] bg-[#fee500] shrink-0"
    aria-hidden="true"
  >
    <svg
      width={Math.round(size * 0.6)}
      height={Math.round(size * 0.6)}
      viewBox="0 0 24 24"
      fill="#3c1e1e"
    >
      <path d="M12 3C6.48 3 2 6.48 2 10.77c0 2.75 1.82 5.17 4.55 6.54l-.95 3.49c-.08.31.26.56.53.39l4.14-2.75c.56.08 1.14.12 1.73.12 5.52 0 10-3.48 10-7.79C22 6.48 17.52 3 12 3z" />
    </svg>
  </span>
);

export const GoogleGIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    aria-hidden="true"
    className="shrink-0"
  >
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.3 0 6.08-1.09 8.1-2.96l-3.88-3.05c-1.1.74-2.51 1.18-4.22 1.18-3.24 0-5.99-2.19-6.97-5.13H1.02v3.14C3.05 21.21 7.21 24 12 24Z"
    />
    <path
      fill="#FBBC05"
      d="M5.03 14.04c-.25-.74-.39-1.54-.39-2.36 0-.82.14-1.62.39-2.36V6.18H1.02A11.98 11.98 0 0 0 0 11.68c0 1.93.46 3.76 1.02 5.5l4.01-3.14Z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.8 0 3.41.62 4.68 1.83l3.51-3.51C18.07 1.18 15.3 0 12 0 7.21 0 3.05 2.79 1.02 6.82l4.01 3.14C6.01 6.94 8.76 4.75 12 4.75Z"
    />
  </svg>
);

export const SafeImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  priority?: boolean;
}> = ({
  src,
  alt,
  className = '',
  fallbackSrc = '/images/hero-crab-whole.jpg',
  priority = false,
}) => {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const displaySrc = failedSrc === src ? fallbackSrc : src;

  return (
    <img
      src={displaySrc}
      alt={alt}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
      onError={() => {
        if (displaySrc !== fallbackSrc) {
          setFailedSrc(src);
        }
      }}
    />
  );
};
