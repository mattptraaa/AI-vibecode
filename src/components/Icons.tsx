import React from 'react';

export const LogoIcon: React.FC<{ size?: number; className?: string }> = ({ size = 40, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="50" cy="50" r="47" fill="#ffffff" stroke="#5BC0F8" strokeWidth="3" />
    {/* Stylized V */}
    <path d="M24 32 L47 78 L55 78 L80 26 L67 26 L51 62 L36 32 Z" fill="#FFD23F" stroke="#F5B700" strokeWidth="1" />
    {/* Blue globe shield */}
    <ellipse cx="50" cy="38" rx="14" ry="14" fill="#0E2A47" />
    <path d="M38 38 Q50 32 62 38 Q50 44 38 38" fill="#FFD23F" />
    <path d="M50 25 L50 51" stroke="#5BC0F8" strokeWidth="1.5" strokeDasharray="2 1" />
    <path d="M40 33 L60 43" stroke="#5BC0F8" strokeWidth="1.2" />
    <path d="M40 43 L60 33" stroke="#5BC0F8" strokeWidth="1.2" />
    {/* Orbital rings */}
    <circle cx="20" cy="40" r="3.5" fill="#5BC0F8" />
    <circle cx="34" cy="74" r="4.5" fill="#FF4081" />
    <circle cx="76" cy="62" r="3" fill="#00E5FF" />
    <path d="M18 42 A38 38 0 0 0 78 72" stroke="#FF4081" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    {/* Typography */}
    <text x="50" y="88" textAnchor="middle" fontFamily="Instrument Sans, sans-serif" fontWeight="800" fontSize="7.5" fill="#0E2A47" letterSpacing="0.04em">
      UT FAMILY
    </text>
  </svg>
);

export const InstagramIcon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <radialGradient id="igGrad" cx="30%" cy="107%" r="130%">
        <stop offset="0%" stopColor="#fdf497" />
        <stop offset="5%" stopColor="#fdf497" />
        <stop offset="45%" stopColor="#fd5949" />
        <stop offset="60%" stopColor="#d6249f" />
        <stop offset="90%" stopColor="#285AEB" />
      </radialGradient>
    </defs>
    <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#igGrad)" />
    <rect x="6" y="6" width="12" height="12" rx="3.5" stroke="#ffffff" strokeWidth="1.8" />
    <circle cx="12" cy="12" r="3" stroke="#ffffff" strokeWidth="1.8" />
    <circle cx="15.5" cy="8.5" r="0.9" fill="#ffffff" />
  </svg>
);

export const WhatsAppIcon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="6" fill="#25D366" />
    <path
      d="M17.5 14.3c-.2-.1-1.3-.7-1.5-.7s-.4-.1-.5.1-.6.7-.7.9-.3.2-.5.1c-.2-.1-.9-.3-1.7-1.1-.6-.6-1.1-1.3-1.2-1.5-.1-.2 0-.4.1-.5.1-.1.2-.3.3-.4.1-.1.1-.2.2-.3.1-.1 0-.3 0-.4-.1-.1-.5-1.3-.7-1.8-.2-.5-.4-.4-.5-.4h-.4c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2 0 1.1.8 2.2.9 2.4.1.1 1.6 2.5 3.9 3.5.5.2 1 .4 1.3.5.6.2 1.1.2 1.5.1.5-.1 1.3-.6 1.5-1.1.2-.5.2-1 .1-1.1-.1-.1-.3-.2-.5-.3z"
      fill="#ffffff"
    />
  </svg>
);

export const TikTokIcon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="6" fill="#000000" />
    <path
      d="M15.5 8.2c-.7-.4-1.3-1-1.6-1.7V14a3.8 3.8 0 1 1-3.8-3.8c.3 0 .7.1 1 .2V12a2 2 0 1 0 1.2 1.9V5h1.7c.3 1.2 1.3 2.1 2.5 2.3v1.9c-.3-.3-.7-.6-1-.9z"
      fill="#25F4EE"
    />
    <path
      d="M15.2 8.5c-.7-.4-1.3-1-1.6-1.7V14a3.8 3.8 0 1 1-3.8-3.8c.3 0 .7.1 1 .2V12a2 2 0 1 0 1.2 1.9V5h1.7c.3 1.2 1.3 2.1 2.5 2.3v1.9c-.3-.3-.7-.6-1-.9z"
      fill="#FE2C55"
      transform="translate(0.5, 0.5)"
    />
    <path
      d="M15.2 8.2c-.7-.4-1.3-1-1.6-1.7V14a3.8 3.8 0 1 1-3.8-3.8c.3 0 .7.1 1 .2V12a2 2 0 1 0 1.2 1.9V5h1.7c.3 1.2 1.3 2.1 2.5 2.3v1.9c-.3-.3-.7-.6-1-.9z"
      fill="#ffffff"
    />
  </svg>
);
