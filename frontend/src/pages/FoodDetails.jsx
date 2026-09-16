import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  Flame,
  Clock,
  ShieldCheck,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  Sparkles,
  Quote,
} from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';

const FoodDetails = () => {
  const { id } = useParams();
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchFoodDetails = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/foods/${id}`);
        if (res?.data) {
          setFood(res.data);
        }
      } catch (err) {
        console.error('Error fetching food details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFoodDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!food) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-serif font-bold text-stone-900">Food Item Not Found</h2>
        <p className="text-stone-500 text-sm">The dish you are searching for might have been retired or updated.</p>
        <Link to="/menu" className="inline-block px-6 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm">
          Return to Menu
        </Link>
      </div>
    );
  }

  const currentPrice = food.discountPrice > 0 ? food.discountPrice : food.price;
  const hasDiscount = food.discountPrice > 0 && food.discountPrice < food.price;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 animate-fade-in">
      {/* Back to Menu Link */}
      <div>
        <Link
          to="/menu"
          className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Menu</span>
        </Link>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
        {/* Left: HD Food Image */}
        <div className="relative rounded-3xl overflow-hidden bg-stone-100 border border-stone-200 shadow-lg aspect-[4/3]">
          <img
            src={food.image}
            alt={food.name}
            className="w-full h-full object-cover"
          />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            <span
              className={`w-7 h-7 rounded-lg flex items-center justify-center bg-white/95 backdrop-blur-sm shadow-md border ${
                food.foodType === 'veg' ? 'border-emerald-600' : 'border-rose-600'
              }`}
            >
              <span
                className={`w-3 h-3 rounded-full ${
                  food.foodType === 'veg' ? 'bg-emerald-600' : 'bg-rose-600'
                }`}
              ></span>
            </span>

            {food.isPopular && (
              <span className="px-3 py-1 rounded-lg bg-amber-500 text-white text-xs font-bold shadow-md">
                Bestseller
              </span>
            )}
          </div>

          <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-stone-900/90 text-amber-400 text-sm font-bold flex items-center gap-1.5 shadow-md">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{food.rating ? food.rating.toFixed(1) : '4.8'}</span>
            <span className="text-xs text-stone-400 font-normal">
              ({food.numReviews || 0} reviews)
            </span>
          </div>
        </div>

        {/* Right: Culinary Information */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600">
              {food.category?.name || 'SwadGhar Signature'}
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 leading-tight">
              {food.name}
            </h1>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed pt-1">
              {food.description}
            </p>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-2xl bg-stone-100/80 border border-stone-200/80 flex items-center justify-between">
            <div>
              <span className="text-xs text-stone-500 font-medium block">Price per portion</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-stone-900 font-sans">
                  ₹{currentPrice}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-stone-400 line-through">
                    ₹{food.price}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold text-stone-600">
              <span className="flex items-center gap-1">
                <Flame className="w-4 h-4 text-amber-500" />
                {food.spiceLevel?.toUpperCase()}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-brand-500" />
                {food.preparationTime || 20} Mins
              </span>
            </div>
          </div>

          {/* Nutrition Grid */}
          {food.nutrition && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Nutritional Profile (Approx.)
              </h4>
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-2.5 rounded-xl bg-white border border-stone-200 shadow-sm">
                  <span className="block text-sm font-bold text-stone-900">{food.nutrition.calories || 0}</span>
                  <span className="text-[10px] text-stone-400 uppercase font-semibold">Calories</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-stone-200 shadow-sm">
                  <span className="block text-sm font-bold text-stone-900">{food.nutrition.protein || 0}g</span>
                  <span className="text-[10px] text-stone-400 uppercase font-semibold">Protein</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-stone-200 shadow-sm">
                  <span className="block text-sm font-bold text-stone-900">{food.nutrition.carbs || 0}g</span>
                  <span className="text-[10px] text-stone-400 uppercase font-semibold">Carbs</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-stone-200 shadow-sm">
                  <span className="block text-sm font-bold text-stone-900">{food.nutrition.fats || 0}g</span>
                  <span className="text-[10px] text-stone-400 uppercase font-semibold">Fats</span>
                </div>
              </div>
            </div>
          )}

          {/* Key Ingredients */}
          {food.ingredients && food.ingredients.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Fresh Ingredients & Herbs
              </h4>
              <div className="flex flex-wrap gap-2">
                {food.ingredients.map((ing, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg bg-stone-200/70 text-stone-800 text-xs font-medium"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className="pt-4 border-t border-stone-200 flex items-center gap-4">
            <div className="flex items-center gap-3 bg-stone-100 rounded-2xl p-1.5 border border-stone-200">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-9 h-9 rounded-xl bg-white hover:bg-stone-200 shadow-sm flex items-center justify-center text-stone-800 font-bold transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-base font-bold w-6 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-9 h-9 rounded-xl bg-white hover:bg-stone-200 shadow-sm flex items-center justify-center text-stone-800 font-bold transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => addToCart(food, quantity)}
              className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 hover:to-amber-500 text-white font-bold text-base shadow-lg shadow-brand-500/25 hover:shadow-glow transition-all flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Add to Cart • ₹{currentPrice * quantity}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="pt-12 border-t border-stone-200 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-serif font-bold text-stone-900">
            Diner Reviews & Ratings
          </h3>
          <span className="text-xs text-stone-500">
            {food.reviews?.length || 0} verified customer reviews
          </span>
        </div>

        {food.reviews && food.reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {food.reviews.map((rev) => (
              <div
                key={rev._id}
                className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={rev.customerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                      alt={rev.customerName}
                      className="w-9 h-9 rounded-full object-cover border border-stone-200"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-stone-900">{rev.customerName}</h4>
                      <p className="text-[11px] text-stone-400">
                        {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-stone-500 text-sm">
            No reviews yet for this culinary dish. Be the first to order and review!
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodDetails;
