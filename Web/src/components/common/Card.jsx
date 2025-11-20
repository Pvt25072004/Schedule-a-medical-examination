import React from 'react';

const Card = ({ 
  children, 
  className = '',
  hover = false,
  onClick,
  padding = 'md',
  shadow = 'md',
  border = true
}) => {
  const paddingSizes = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  const shadowSizes = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };

  const hoverClass = hover ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer' : '';
  const clickableClass = onClick ? 'cursor-pointer' : '';
  const borderClass = border ? 'border border-gray-200' : '';

  return (
    <div 
      onClick={onClick}
      className={`
        bg-white rounded-xl transition-all duration-300
        ${paddingSizes[padding]}
        ${shadowSizes[shadow]}
        ${borderClass}
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