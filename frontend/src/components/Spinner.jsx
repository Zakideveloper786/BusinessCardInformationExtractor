import React from 'react';

const Spinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div
      className={`inline-block rounded-full border-t-transparent border-solid animate-spin ${sizeClasses[size]} border-blue-500 ${className}`}
      style={{ borderColor: '#3b82f6', borderTopColor: 'transparent' }}
      role="status"
    />
  );
};

export default Spinner;
