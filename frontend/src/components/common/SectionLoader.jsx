import React from 'react';
import CookingLoader from './CookingLoader';

/**
 * Universal Section Loader Component for SwadGhar
 * Provides cooking animations, skeleton placeholders, or minimal loaders for page sections.
 *
 * @param {'cooking' | 'skeleton' | 'minimal' | 'table'} variant - Visual style of loader
 * @param {string} title - Main loading title
 * @param {string} subtitle - Subtitle description
 * @param {'sm' | 'md' | 'lg'} size - Size variant
 * @param {number} count - Number of skeleton items if variant is 'skeleton'
 * @param {string} className - Extra CSS classes
 */
const SectionLoader = ({
  variant = 'cooking',
  title = 'Cooking in Progress...',
  subtitle = 'Fetching fresh handcrafted dishes from our kitchen...',
  size = 'md',
  count = 4,
  className = '',
}) => {
  if (variant === 'skeleton') {
    return (
      <div className={`w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in ${className}`}>
        {[...Array(count)].map((_, idx) => (
          <div
            key={idx}
            className="rounded-3xl bg-white border border-stone-200/80 p-4 space-y-4 shadow-sm animate-pulse"
          >
            <div className="aspect-[4/3] bg-stone-100 rounded-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-stone-200/40 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-stone-100 rounded-md w-3/4" />
              <div className="h-3 bg-stone-100 rounded-md w-full" />
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="h-5 bg-stone-100 rounded w-1/3" />
              <div className="h-9 w-24 bg-stone-100 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={`w-full bg-white rounded-3xl border border-stone-200/80 p-6 space-y-4 shadow-sm animate-pulse ${className}`}>
        <div className="h-6 bg-stone-100 rounded-lg w-1/4 mb-4" />
        {[...Array(count)].map((_, idx) => (
          <div key={idx} className="flex items-center justify-between py-3 border-b border-stone-100 last:border-0 gap-4">
            <div className="h-4 bg-stone-100 rounded w-1/5" />
            <div className="h-4 bg-stone-100 rounded w-1/4" />
            <div className="h-4 bg-stone-100 rounded w-1/6" />
            <div className="h-4 bg-stone-100 rounded w-1/8" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center justify-center gap-3 py-6 text-stone-500 animate-fade-in ${className}`}>
        <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold tracking-wide text-stone-600">{title}</span>
      </div>
    );
  }

  // Default: Cooking Loader variant
  return (
    <div className={`w-full flex items-center justify-center min-h-[300px] ${className}`}>
      <CookingLoader
        text={title}
        subtext={subtitle}
        size={size}
      />
    </div>
  );
};

export default SectionLoader;
