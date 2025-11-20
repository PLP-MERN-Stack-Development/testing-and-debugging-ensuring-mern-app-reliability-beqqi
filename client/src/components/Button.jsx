import React from 'react';

const Button = ({ children, variant = 'primary', size = 'md', disabled = false, className = '', ...rest }) => {
  const variantClass = `btn-${variant}`;
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : 'btn-md';
  const disabledClass = disabled ? 'btn-disabled' : '';

  return (
    <button
      className={`btn ${variantClass} ${sizeClass} ${disabledClass} ${className}`.trim()}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
