import React from 'react';

/**
 * Single Food Card Skeleton with smooth pulse and shimmer effects
 */
export const FoodCardSkeleton = () => {
  return (
    <div className="rounded-3xl bg-white border border-stone-200/80 overflow-hidden shadow-sm flex flex-col justify-between h-full animate-pulse">
      {/* Food Image Container Skeleton */}
      <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-stone-200 via-stone-100 to-stone-200">
        {/* Top Badges Placeholder */}
        <div className="absolute top-3 left-3 flex gap-1.5 z-10">
          <div className="w-6 h-6 rounded-md bg-stone-300/80"></div>
          <div className="w-14 h-5 rounded-md bg-stone-300/80"></div>
        </div>

        {/* Rating Badge Placeholder */}
        <div className="absolute bottom-3 right-3 w-12 h-6 rounded-full bg-stone-300/80"></div>
      </div>

      {/* Food Details Skeleton */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          {/* Category & Preparation Time Row */}
          <div className="flex items-center justify-between">
            <div className="h-3.5 w-24 bg-stone-200 rounded-md"></div>
            <div className="h-3 w-14 bg-stone-200 rounded-md"></div>
          </div>

          {/* Dish Title */}
          <div className="h-5 w-3/4 bg-stone-300 rounded-md"></div>

          {/* Description Lines */}
          <div className="space-y-1.5 pt-1">
            <div className="h-3 w-full bg-stone-200/80 rounded"></div>
            <div className="h-3 w-4/5 bg-stone-200/80 rounded"></div>
          </div>
        </div>

        {/* Price & Action Button Row */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2 mt-auto">
          {/* Price */}
          <div className="space-y-1">
            <div className="h-5 w-16 bg-stone-300 rounded-md"></div>
            <div className="h-2.5 w-12 bg-stone-200 rounded"></div>
          </div>

          {/* Add Button */}
          <div className="h-9 w-20 rounded-xl bg-gradient-to-r from-stone-300 to-stone-200"></div>
        </div>
      </div>
    </div>
  );
};

/**
 * Grid of Food Card Skeletons
 * @param {number} count - Number of skeleton cards to render (default 12 for Menu, 4 or 8 for Home)
 * @param {string} className - Grid styling overrides
 */
export const FoodCardSkeletonGrid = ({ count = 12, className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6' }) => {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, idx) => (
        <FoodCardSkeleton key={`food-skeleton-${idx}`} />
      ))}
    </div>
  );
};

/**
 * Detailed Food Page Skeleton Loader
 */
export const FoodDetailsSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 animate-pulse">
      {/* Top Back Link */}
      <div className="h-6 w-36 bg-stone-200 rounded-lg"></div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Image Skeleton */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-stone-200 via-stone-100 to-stone-200"></div>
          <div className="grid grid-cols-3 gap-3">
            <div className="h-16 bg-stone-100 rounded-2xl"></div>
            <div className="h-16 bg-stone-100 rounded-2xl"></div>
            <div className="h-16 bg-stone-100 rounded-2xl"></div>
          </div>
        </div>

        {/* Right Column: Details Skeleton */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-3">
            <div className="h-4 w-28 bg-stone-200 rounded"></div>
            <div className="h-10 w-4/5 bg-stone-300 rounded-xl"></div>
            <div className="h-5 w-32 bg-stone-200 rounded-md"></div>
          </div>

          <div className="space-y-2">
            <div className="h-3.5 w-full bg-stone-200 rounded"></div>
            <div className="h-3.5 w-5/6 bg-stone-200 rounded"></div>
            <div className="h-3.5 w-4/6 bg-stone-200 rounded"></div>
          </div>

          <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200/80 space-y-4">
            <div className="h-8 w-28 bg-stone-300 rounded-lg"></div>
            <div className="h-12 w-full bg-stone-300 rounded-2xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodCardSkeleton;
