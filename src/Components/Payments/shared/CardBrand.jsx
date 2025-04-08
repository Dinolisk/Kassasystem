import React from 'react';

const CardBrand = ({ type }) => {
  const brands = {
    visa: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="80" height="50">
        <rect width="48" height="48" rx="4" fill="#1a1f71"/>
        <path fill="#fff" d="M30.5 32h3.2l-2.8-13h-3.2l-2.8 13h3.2l.6-3h3.5l.3 3zm-5.5-6l1.1-5.5 1.1 5.5h-2.2zm-6.5 6h3.2l1.5-13h-3.2l-1.5 13zm-5.5-13h-3.2l-2.8 13h3.2l.6-3h3.5l.3 3h3.2l-2.8-13zm-1.2 5l1.1-5.5 1.1 5.5h-2.2z"/>
      </svg>
    ),
    mastercard: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="80" height="50">
        <rect width="48" height="48" rx="4" fill="#000"/>
        <circle cx="18" cy="24" r="8" fill="#eb001b"/>
        <circle cx="30" cy="24" r="8" fill="#f79e1b"/>
        <path fill="#ff5f00" d="M24 16a8 8 0 00-6 2.9 8 8 0 016 2.9 8 8 0 016-2.9 8 8 0 00-6-2.9z"/>
      </svg>
    ),
    amex: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="80" height="50">
        <rect width="48" height="48" rx="4" fill="#016fd0"/>
        <path fill="#fff" d="M12 18h3v12h-3v-12zm4 0h2.5l2.5 4 2.5-4h2.5v12h-3v-4l-2 4h-1l-2-4v4h-3v-12zm12 0h6v3h-3v2h3v3h-3v2h3v3h-6v-12z"/>
      </svg>
    )
  };

  return (
    <div className="card-brand" aria-label={type}>
      {brands[type.toLowerCase()]}
    </div>
  );
};

export default CardBrand;
