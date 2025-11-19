import React from 'react';

const Input = ({ 
  type = 'text',
  placeholder,
  value,
  onChange,
  name,
  icon: Icon,
  iconPosition = 'left',
  error,
  label,
  required = false,
  disabled = false,
  helperText,
  className = '',
  ...props 
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <Icon className={`w-5 h-5 ${error ? 'text-red-500' : 'text-gray-400'}`} />
          </div>
        )}
        
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-4 py-2.5 border rounded-lg 
            transition-all duration-200
            focus:outline-none focus:ring-2
            ${Icon && iconPosition === 'left' ? 'pl-11' : ''}
            ${Icon && iconPosition === 'right' ? 'pr-11' : ''}
            ${error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
            }
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
            ${className}
          `}
          {...props}
        />

        {Icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <Icon className={`w-5 h-5 ${error ? 'text-red-500' : 'text-gray-400'}`} />
          </div>
        )}
      </div>
      
      {helperText && !error && (
        <p className="text-sm text-gray-500 mt-1">{helperText}</p>
      )}
      
      {error && (
        <div className="flex items-center gap-1 mt-1">
          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};

export default Input;