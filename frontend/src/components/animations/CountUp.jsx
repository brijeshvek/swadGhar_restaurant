import React, { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

export const CountUp = ({
  to,
  from = 0,
  duration = 1.5,
  prefix = '',
  suffix = '',
  className = '',
  separator = ',',
}) => {
  const [count, setCount] = useState(from);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-20px' });

  useEffect(() => {
    if (!isInView) return;

    let start = from;
    const end = Number(to) || 0;
    if (start === end) {
      setCount(end);
      return;
    }

    const totalFrames = Math.round(duration * 60);
    let currentFrame = 0;

    const easeOutQuad = (t) => t * (2 - t);

    const timer = setInterval(() => {
      currentFrame++;
      const progress = easeOutQuad(currentFrame / totalFrames);
      const currentVal = Math.round(start + (end - start) * progress);

      setCount(currentVal);

      if (currentFrame >= totalFrames) {
        clearInterval(timer);
        setCount(end);
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [isInView, to, from, duration]);

  const formattedCount = separator
    ? count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator)
    : count;

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formattedCount}
      {suffix}
    </span>
  );
};

export default CountUp;
