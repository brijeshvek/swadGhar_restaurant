import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export const AnimatedContent = ({
  children,
  distance = 30,
  direction = 'vertical', // 'vertical' | 'horizontal'
  reverse = false,
  duration = 0.6,
  delay = 0,
  ease = [0.25, 0.1, 0.25, 1],
  className = '',
  viewport = { once: true, margin: '-40px' },
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, viewport);

  const getInitialPosition = () => {
    if (direction === 'vertical') {
      return { y: reverse ? -distance : distance, opacity: 0 };
    }
    return { x: reverse ? -distance : distance, opacity: 0 };
  };

  return (
    <motion.div
      ref={ref}
      initial={getInitialPosition()}
      animate={inView ? { x: 0, y: 0, opacity: 1 } : getInitialPosition()}
      transition={{
        duration,
        delay,
        ease,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedContent;
