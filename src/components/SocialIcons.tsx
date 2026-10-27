import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

export const InstagramIcon: React.FC<IconProps> = ({ size = 18, className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.75" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

export const FacebookIcon: React.FC<IconProps> = ({ size = 18, className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export const PinterestIcon: React.FC<IconProps> = ({ size = 18, className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.966 1.406-5.966s-.359-.72-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
  </svg>
);

export const SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/vearings',
  facebook: 'https://www.facebook.com/share/1Ey49qHXEr/',
  pinterest: 'https://pin.it/5fy06MebI'
};

interface SocialLinksGroupProps {
  size?: number;
  className?: string;
  itemClassName?: string;
}

export const SocialLinksGroup: React.FC<SocialLinksGroupProps> = ({
  size = 18,
  className = 'flex items-center gap-6',
  itemClassName = 'text-onyx/60 hover:text-gold transition-all duration-300 transform hover:scale-110'
}) => {
  return (
    <div className={className}>
      <a 
        href={SOCIAL_LINKS.instagram} 
        target="_blank" 
        rel="noopener noreferrer" 
        className={itemClassName}
        aria-label="Follow ANOVI on Instagram"
        title="Follow us on Instagram (@vearings)"
      >
        <InstagramIcon size={size} />
      </a>
      <a 
        href={SOCIAL_LINKS.facebook} 
        target="_blank" 
        rel="noopener noreferrer" 
        className={itemClassName}
        aria-label="Connect with ANOVI on Facebook"
        title="Connect on Facebook"
      >
        <FacebookIcon size={size} />
      </a>
      <a 
        href={SOCIAL_LINKS.pinterest} 
        target="_blank" 
        rel="noopener noreferrer" 
        className={itemClassName}
        aria-label="Explore Haute Joaillerie moodboards on Pinterest"
        title="Explore Collections on Pinterest"
      >
        <PinterestIcon size={size} />
      </a>
    </div>
  );
};
