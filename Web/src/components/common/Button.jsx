import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({ 
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-green-500 hover:bg-green-600 active:bg-green-700 text-white shadow-sm hover:shadow focus:ring-green-500",
    secondary: "bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-800 focus:ring-gray-500",
    outline: "border-2 border-green-500 text-green-600 hover:bg-green-50 active:bg-green-100 focus:ring-green-500",
    ghost: "text-green-600 hover:bg-green-50 active:bg-green-100 focus:ring-green-500",
    danger: "bg-red-500 hover:bg-red-600 active:bg-red-700 text-white shadow-sm hover:shadow focus:ring-red-500",
    success: "bg-green-600 hover:bg-green-700 active:bg-green-800 text-white shadow-sm hover:shadow focus:ring-green-600"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm gap-1.5",
    md: "px-4 py-2.5 text-base gap-2",
    lg: "px-6 py-3 text-lg gap-2.5"
  };
  
  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  const buttonClasses = `
    ${baseStyles}
    ${variants[variant]}
    ${sizes[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const IconComponent = icon;
  const iconClass = iconSizes[size];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={buttonClasses}
      {...props}
    >
      {loading && <Loader2 className={`${iconClass} animate-spin`} />}
      {!loading && icon && iconPosition === 'left' && <IconComponent className={iconClass} />}
      {children}
      {!loading && icon && iconPosition === 'right' && <IconComponent className={iconClass} />}
    </button>
  );
};

export default Button;