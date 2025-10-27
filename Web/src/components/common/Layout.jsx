import React from 'react';
import Header from './Header';

const Layout = ({ 
  children,
  title,
  subtitle,
  showBack = false,
  showSettings = false,
  onBack,
  onSettings,
  headerAction,
  maxWidth = '6xl',
  className = ''
}) => {
  const maxWidthClass = {
    '4xl': 'max-w-4xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    'full': 'max-w-full'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title={title}
        subtitle={subtitle}
        showBack={showBack}
        showSettings={showSettings}
        onBack={onBack}
        onSettings={onSettings}
        rightAction={headerAction}
      />
      
      <div className={`${maxWidthClass[maxWidth]} mx-auto p-6 ${className}`}>
        {children}
      </div>
    </div>
  );
};

export default Layout;