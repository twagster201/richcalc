
import React from 'react';

export const Button = ({ variant = 'default', onClick, children, className = '' }) => {
  // You can either switch on variant or define a helper function:
  let variantClasses = '';

  switch (variant) {
    case 'default':
      variantClasses = 'bg-blue-500 text-white';
      break;
    case 'secondary':
      variantClasses = 'bg-gray-300 text-black';
      break;
    case 'nav':
      // For example, a distinct color and size for top-level nav
      variantClasses = 'bg-purple-500 text-white hover';
      break;
    default:
      variantClasses = 'bg-blue-500 text-white hover:bg-blue-600';
      break;
  }

 const baseStyle = 'px-4 py-2 rounded focus:outline-none';

  return (
    <button onClick={onClick} className={`${baseStyle} ${variantClasses} ${className}`}>
      {children}
    </button>
  );
};
