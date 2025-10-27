import React from 'react';

const Card = ({ 
  children, 
  className = '',
  hover = false,
  onClick,
  padding = 'md'
}) => {
  const paddingSizes = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    none: ''
  };

  const hoverClass = hover ? 'hover:shadow-lg cursor-pointer transform hover:-translate-y-1' : '';
  const clickableClass = onClick ? 'cursor-pointer' : '';

  return (
    <div 
      onClick={onClick}
      className={`
        bg-white rounded-2xl shadow-md transition-all duration-200
        ${paddingSizes[padding]}
        ${hoverClass}
        ${clickableClass}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;