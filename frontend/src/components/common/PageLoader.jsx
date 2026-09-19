import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import CookingLoader from './CookingLoader';

/**
 * Global Page Loader & Top Navigation Progress Bar
 * Provides a top slim loading bar on route changes and a full-screen cooking loader when triggered.
 */
export const TopProgressBar = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Trigger top bar on route change
    setLoading(true);
    setProgress(20);

    const timer1 = setTimeout(() => setProgress(65), 100);
    const timer2 = setTimeout(() => setProgress(90), 200);
    const timer3 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 200);
    }, 350);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [location.pathname, location.search]);

  if (!loading && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[99999] h-1 pointer-events-none overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-amber-500 via-brand-500 to-yellow-400 shadow-[0_0_10px_rgba(234,88,12,0.8)] transition-all duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

/**
 * Full Page Cooking Loader Overlay
 */
const PageLoader = ({
  text = 'Preparing SwadGhar Experience...',
  subtext = 'Handcrafting flavors, brewing spices, and loading authentic delicacies...',
}) => {
  return (
    <CookingLoader
      fullScreen={true}
      text={text}
      subtext={subtext}
      size="lg"
    />
  );
};

export default PageLoader;
