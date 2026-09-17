import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export const BlurText = ({
  text = '',
  delay = 0.05,
  className = '',
  animateBy = 'words', // 'words' | 'letters'
  direction = 'top', // 'top' | 'bottom'
  threshold = 0.1,
  rootMargin = '-50px',
  onAnimationComplete,
}) => {
  const elements = animateBy === 'words' ? text.split(' ') : text.split('');
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: rootMargin, amount: threshold });

  const defaultFrom =
    direction === 'top'
      ? { filter: 'blur(10px)', opacity: 0, transform: 'translate3d(0,-20px,0)' }
      : { filter: 'blur(10px)', opacity: 0, transform: 'translate3d(0,20px,0)' };

  const defaultTo = {
    filter: 'blur(0px)',
    opacity: 1,
    transform: 'translate3d(0,0,0)',
  };

  return (
    <span ref={ref} className={`inline-block ${className}`}>
      {elements.map((segment, index) => (
        <motion.span
          key={index}
          initial={defaultFrom}
          animate={inView ? defaultTo : defaultFrom}
          transition={{
            duration: 0.5,
            delay: index * delay,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          onAnimationComplete={index === elements.length - 1 ? onAnimationComplete : undefined}
          className="inline-block"
        >
          {segment}
          {animateBy === 'words' && index < elements.length - 1 ? '\u00A0' : ''}
        </motion.span>
      ))}
    </span>
  );
};

export default BlurText;
