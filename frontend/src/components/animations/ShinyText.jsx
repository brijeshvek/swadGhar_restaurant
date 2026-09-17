import React from 'react';

export const ShinyText = ({
  text,
  disabled = false,
  speed = 5,
  className = '',
  children,
}) => {
  const content = text || children;
  const animationDuration = `${speed}s`;

  return (
    <span
      className={`inline-block bg-clip-text text-transparent bg-gradient-to-r from-stone-900 via-amber-500 to-stone-900 dark:from-white dark:via-amber-300 dark:to-white bg-[length:200%_auto] ${
        disabled ? '' : 'animate-shine'
      } ${className}`}
      style={{
        animationDuration,
        backgroundImage:
          'linear-gradient(120deg, rgba(255, 255, 255, 0) 30%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0) 70%)',
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
      }}
    >
      {content}
    </span>
  );
};

export default ShinyText;
