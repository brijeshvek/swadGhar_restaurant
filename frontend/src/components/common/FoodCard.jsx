import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Flame, Plus, Minus, Check, Clock } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const FoodCard = ({ food }) => {
  const { cartItems, addToCart, updateQuantity } = useCart();

  const cartItem = cartItems.find((item) => item.food._id === food._id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const currentPrice = food.discountPrice > 0 ? food.discountPrice : food.price;
  const hasDiscount = food.discountPrice > 0 && food.discountPrice < food.price;
  const discountPercent = hasDiscount
    ? Math.round(((food.price - food.discountPrice) / food.price) * 100)
    : 0;

  return (
    <div className="group rounded-2xl bg-white border border-stone-200/80 hover:border-brand-500/30 overflow-hidden shadow-sm hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between">
      {/* Food Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
        <Link to={`/food/${food._id || food.slug}`} className="block w-full h-full">
          <img
            src={food.image}
            alt={food.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {/* Veg/Non-Veg Badge */}
          <span
            className={`w-6 h-6 rounded-md flex items-center justify-center bg-white/95 backdrop-blur-sm shadow-sm border ${
              food.foodType === 'veg'
                ? 'border-emerald-600'
                : food.foodType === 'vegan'
                ? 'border-teal-600'
                : 'border-rose-600'
            }`}
            title={food.foodType}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                food.foodType === 'veg'
                  ? 'bg-emerald-600'
                  : food.foodType === 'vegan'
                  ? 'bg-teal-600'
                  : 'bg-rose-600'
              }`}
            ></span>
          </span>

          {food.isPopular && (
            <span className="px-2 py-0.5 rounded-md bg-amber-500/90 backdrop-blur-sm text-white text-[11px] font-bold shadow-sm">
              Popular
            </span>
          )}

          {hasDiscount && (
            <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[11px] font-bold shadow-sm">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Rating Badge */}
        <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-stone-900/85 backdrop-blur-md text-amber-400 text-xs font-bold flex items-center gap-1 shadow-md">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{food.rating ? food.rating.toFixed(1) : '4.8'}</span>
        </div>
      </div>

      {/* Food Content Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="font-medium text-brand-600">
              {food.category?.name || 'SwadGhar Delicacy'}
            </span>
            {food.preparationTime && (
              <span className="flex items-center gap-1 text-[11px]">
                <Clock className="w-3 h-3 text-stone-400" />
                {food.preparationTime} mins
              </span>
            )}
          </div>

          <Link
            to={`/food/${food._id || food.slug}`}
            className="block group-hover:text-brand-600 transition-colors"
          >
            <h3 className="font-serif font-bold text-base sm:text-lg text-stone-900 leading-snug line-clamp-1">
              {food.name}
            </h3>
          </Link>

          <p className="text-xs sm:text-sm text-stone-500 line-clamp-2 leading-relaxed">
            {food.description}
          </p>
        </div>

        {/* Price & Action Button */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
          {/* Price */}
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-xl font-bold text-stone-900 font-sans">
                ₹{currentPrice}
              </span>
              {hasDiscount && (
                <span className="text-xs text-stone-400 line-through">
                  ₹{food.price}
                </span>
              )}
            </div>
            <span className="text-[10px] text-stone-400 block">Taxes extra</span>
          </div>

          {/* Add to Cart Actions */}
          {!food.isAvailable ? (
            <span className="text-xs font-semibold text-rose-500 bg-rose-50 px-3 py-1.5 rounded-xl">
              Sold Out
            </span>
          ) : quantityInCart > 0 ? (
            <div className="inline-flex items-center gap-2 bg-stone-900 text-white rounded-xl p-1 shadow-sm">
              <button
                onClick={() => updateQuantity(food._id, quantityInCart - 1)}
                className="w-7 h-7 rounded-lg bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-white transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-bold w-4 text-center">{quantityInCart}</span>
              <button
                onClick={() => updateQuantity(food._id, quantityInCart + 1)}
                className="w-7 h-7 rounded-lg bg-brand-600 hover:bg-brand-500 flex items-center justify-center text-white transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addToCart(food, 1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 active:scale-95 text-white text-xs sm:text-sm font-semibold shadow-sm hover:shadow-glow transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
