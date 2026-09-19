import React from 'react';

/**
 * Premium Cooking Animation Loader for SwadGhar Restaurant
 * Features a dynamic tossing pan, rising steam ribbons, flame glow, and flying ingredients.
 *
 * @param {boolean} fullScreen - Whether to display as an overlay covering the entire viewport
 * @param {string} text - Main cooking status title
 * @param {string} subtext - Supporting cooking description or quote
 * @param {'sm' | 'md' | 'lg'} size - Size variant
 * @param {boolean} dark - Dark theme variant
 */
const CookingLoader = ({
  fullScreen = false,
  text = 'Cooking Fresh Authentic Delicacies...',
  subtext = 'Infusing royal spices, slow-simmering flavors & pure desi ghee',
  size = 'md',
  dark = false,
}) => {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  const containerContent = (
    <div className={`flex flex-col items-center justify-center text-center p-6 select-none ${dark ? 'text-white' : 'text-stone-800'}`}>
      {/* Cooking Pan & Stove Stage */}
      <div className={`relative flex items-center justify-center ${isSm ? 'w-36 h-36' : isLg ? 'w-64 h-64' : 'w-48 h-48'}`}>
        
        {/* Flame Glow Ring */}
        <div className="absolute bottom-6 w-24 h-8 bg-gradient-to-t from-orange-600/40 via-amber-500/20 to-transparent rounded-full blur-md animate-pulse pointer-events-none" />

        {/* Dynamic Rising Steam Ribbons */}
        <div className="absolute -top-3 flex items-center justify-center gap-3 pointer-events-none z-10">
          <span className="w-1.5 h-7 bg-gradient-to-t from-stone-400/40 to-transparent rounded-full animate-steam-1 blur-[0.5px]" />
          <span className="w-2 h-9 bg-gradient-to-t from-amber-300/50 to-transparent rounded-full animate-steam-2 blur-[0.5px]" />
          <span className="w-1.5 h-6 bg-gradient-to-t from-stone-400/40 to-transparent rounded-full animate-steam-3 blur-[0.5px]" />
        </div>

        {/* Tossing Ingredients (Golden Paneer, Fresh Peas, Cherry Tomato, Herb Leaf) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          {/* Item 1: Golden Spiced Paneer Cube */}
          <div className="absolute w-3.5 h-3.5 bg-gradient-to-br from-amber-300 to-yellow-600 rounded-sm shadow-sm animate-toss-1 border border-amber-200/60" />
          
          {/* Item 2: Fresh Emerald Green Pea */}
          <div className="absolute w-2.5 h-2.5 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full shadow-sm animate-toss-2 border border-emerald-200/50" />
          
          {/* Item 3: Red Spiced Tomato/Chili Wedge */}
          <div className="absolute w-3 h-2 bg-gradient-to-br from-red-500 to-rose-700 rounded-full shadow-sm animate-toss-3 border border-rose-300/40" />

          {/* Item 4: Aromatic Cilantro / Herb Leaf */}
          <div className="absolute w-2.5 h-3 bg-gradient-to-br from-lime-400 to-emerald-600 rounded-tl-full rounded-br-full shadow-sm animate-toss-4" />
        </div>

        {/* Animated Frying Pan / Kadai SVG */}
        <div className="relative z-10 animate-pan-toss">
          <svg
            className={`${isSm ? 'w-24 h-24' : isLg ? 'w-40 h-40' : 'w-32 h-32'} filter drop-shadow-xl`}
            viewBox="0 0 160 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Stove Flame Underneath */}
            <g className="animate-flame-flicker">
              <path
                d="M 55 90 Q 60 76 65 90 Q 70 72 75 90 Q 80 74 85 90 Q 90 70 95 90"
                fill="none"
                stroke="url(#flameGrad)"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </g>

            {/* Pan Handle (Wooden Look) */}
            <path
              d="M 20 62 L 52 68"
              stroke="#854d0e"
              strokeWidth="7"
              strokeLinecap="round"
            />
            {/* Handle Metallic Rivet */}
            <circle cx="50" cy="67.5" r="2.5" fill="#d97706" />

            {/* Pan Outer Body (Cast Iron / Premium Carbon Steel) */}
            <path
              d="M 50 68 C 50 88 110 88 110 68 L 106 63 C 106 82 54 82 54 63 Z"
              fill="url(#panBodyGrad)"
              stroke="#292524"
              strokeWidth="1.5"
            />

            {/* Pan Inner Cavity & Sizzling Oil/Ghee Base */}
            <ellipse
              cx="80"
              cy="65"
              rx="28"
              ry="10"
              fill="url(#gheeGrad)"
              stroke="#78350f"
              strokeWidth="1.5"
            />

            {/* Simmering Ghee / Oil Bubbles */}
            <circle cx="72" cy="65" r="1.5" fill="#fef08a" className="animate-ping opacity-80" />
            <circle cx="86" cy="63" r="1" fill="#fde047" className="animate-pulse" />
            <circle cx="79" cy="67" r="1.2" fill="#fed7aa" className="animate-ping opacity-75" />

            {/* Defs for Gradients */}
            <defs>
              <linearGradient id="panBodyGrad" x1="50" y1="63" x2="110" y2="88" gradientUnits="userSpaceOnUse">
                <stop stopColor="#44403c" />
                <stop offset="0.5" stopColor="#292524" />
                <stop offset="1" stopColor="#1c1917" />
              </linearGradient>

              <linearGradient id="gheeGrad" x1="52" y1="55" x2="108" y2="75" gradientUnits="userSpaceOnUse">
                <stop stopColor="#b45309" />
                <stop offset="0.4" stopColor="#f59e0b" />
                <stop offset="0.8" stopColor="#d97706" />
                <stop offset="1" stopColor="#78350f" />
              </linearGradient>

              <linearGradient id="flameGrad" x1="55" y1="90" x2="95" y2="70" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ef4444" />
                <stop offset="0.5" stopColor="#f97316" />
                <stop offset="1" stopColor="#eab308" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Title & Description with Warm Typography */}
      <div className="space-y-1.5 max-w-sm mt-1">
        <h4 className={`font-serif font-bold tracking-wide ${isSm ? 'text-sm' : isLg ? 'text-2xl' : 'text-lg'} ${dark ? 'text-amber-300' : 'text-stone-900'}`}>
          {text}
        </h4>
        {subtext && (
          <p className={`text-xs leading-relaxed ${dark ? 'text-stone-300' : 'text-stone-500'}`}>
            {subtext}
          </p>
        )}
      </div>

      {/* Sizzling Spice Dots Animation */}
      <div className="flex items-center gap-1.5 mt-4">
        <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce [animation-delay:-0.3s]" />
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:-0.15s]" />
        <span className="w-2 h-2 rounded-full bg-yellow-500 animate-bounce" />
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#fbf9f6]/95 backdrop-blur-lg transition-all duration-300 animate-fade-in">
        {containerContent}
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center py-12 px-4 animate-fade-in">
      {containerContent}
    </div>
  );
};

export default CookingLoader;
