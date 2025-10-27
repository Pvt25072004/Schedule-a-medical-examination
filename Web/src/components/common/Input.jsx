import React from 'react';

const Input = ({ 
  type = 'text',
  placeholder,
  value,
  onChange,
  name,
  icon: Icon,
  error,
  label,
  required = false,
  className = '',
  ...props 
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-teal-600" />
        )}
        
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`
            w-full px-4 py-3 border-2 rounded-xl 
            focus:border-teal-500 focus:outline-none transition-colors
            ${Icon ? 'pl-11' : ''}
            ${error ? 'border-red-500' : 'border-gray-200'}
            ${className}
          `}
          {...props}
        />
      </div>
      
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

export default Input;