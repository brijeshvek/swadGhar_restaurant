import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  ChefHat,
  Heart,
  Share2,
  CheckCircle2,
  Leaf,
  MessageSquare,
  Send,
  Loader2,
} from 'lucide-react';
import api from '../services/api';
import CookingLoader from '../components/common/CookingLoader';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  BlurText,
  ShinyText,
  TiltedCard,
  AnimatedContent,
  SpotlightCard,
  Magnetic,
} from '../components/animations';
import FoodCard from '../components/common/FoodCard';

const FoodDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { addToCart } = useCart();

  const [food, setFood] = useState(null);
  const [relatedFoods, setRelatedFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Review Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchFoodDetails = async () => {
      setLoading(true);
      window.scrollTo(0, 0);
      try {
        const res = await api.get(`/foods/${id}`);
        if (res?.data) {
          setFood(res.data);

          // Fetch related foods in same category
          const catId = res.data.category?._id || res.data.category;
          if (catId) {
            const relRes = await api.get(`/foods?category=${catId}&limit=4`);
            if (relRes?.data) {
              setRelatedFoods(relRes.data.filter((f) => f._id !== res.data._id).slice(0, 3));
            }
          }
        }
      } catch (err) {
        console.error('Error fetching food details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFoodDetails();
  }, [id]);

  const handleAddToCart = () => {
    if (!food) return;
    addToCart(food, quantity, specialInstructions);
    setAddedAnimation(true);
    showSuccess(`Added ${quantity}x ${food.name} to your basket!`);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showError('Please sign in to post a verified diner review.');
      navigate('/login');
      return;
    }

    if (!comment.trim()) {
      showError('Please write your review comment.');
      return;
    }

    setSubmittingReview(true);
    try {
      await api.post(`/foods/${food._id}/reviews`, {
        rating,
        comment: comment.trim(),
      });
      showSuccess('Thank you! Your culinary review has been posted.');
      setComment('');

      // Refresh food details to load new review
      const res = await api.get(`/foods/${id}`);
      if (res?.data) setFood(res.data);
    } catch (err) {
      showError(err.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center">
        <CookingLoader
          text="Plating Culinary Delicacy..."
          subtext="Fetching chef's special recipe, ingredients, and spices..."
          size="lg"
        />
      </div>
    );
  }

  if (!food) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
          <ChefHat className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-stone-900">Delicacy Not Found</h2>
        <p className="text-stone-500 text-sm leading-relaxed">
          The dish you are looking for might have been retired for today's service or updated.
        </p>
        <Link
          to="/menu"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm shadow-md hover:bg-brand-500 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Menu</span>
        </Link>
      </div>
    );
  }

  const currentPrice = food.discountPrice > 0 ? food.discountPrice : food.price;
  const hasDiscount = food.discountPrice > 0 && food.discountPrice < food.price;
  const savings = hasDiscount ? food.price - food.discountPrice : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-14">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-stone-500">
        <Link to="/" className="hover:text-brand-600 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link to="/menu" className="hover:text-brand-600 transition-colors">
          Menu
        </Link>
        <span>/</span>
        <Link
          to={`/menu?category=${food.category?.slug || food.category?._id || ''}`}
          className="hover:text-brand-600 transition-colors font-medium text-stone-700"
        >
          {food.category?.name || 'Category'}
        </Link>
        <span>/</span>
        <span className="text-brand-600 font-semibold truncate max-w-[200px]">{food.name}</span>
      </nav>

      {/* Main Details Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* Left 6 cols: 3D Tilted Hero Image */}
        <div className="lg:col-span-6 space-y-4">
          <TiltedCard maxTilt={8} scale={1.01} className="rounded-3xl overflow-hidden shadow-2xl bg-stone-100 border border-stone-200/80 aspect-[4/3] relative">
            <img
              src={food.image}
              alt={food.name}
              className="w-full h-full object-cover"
            />

            {/* Badges Overlay */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
              {/* Veg / Non-Veg Indicator */}
              <span
                className={`w-7 h-7 rounded-lg flex items-center justify-center bg-white/95 backdrop-blur-md shadow-md border ${
                  food.foodType === 'veg'
                    ? 'border-emerald-600'
                    : food.foodType === 'vegan'
                    ? 'border-teal-600'
                    : 'border-rose-600'
                }`}
                title={food.foodType}
              >
                <span
                  className={`w-3 h-3 rounded-full ${
                    food.foodType === 'veg'
                      ? 'bg-emerald-600'
                      : food.foodType === 'vegan'
                      ? 'bg-teal-600'
                      : 'bg-rose-600'
                  }`}
                ></span>
              </span>

              {food.isPopular && (
                <span className="px-3 py-1 rounded-xl bg-amber-500/95 backdrop-blur-sm text-white text-xs font-bold shadow-md flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Bestseller</span>
                </span>
              )}

              {hasDiscount && (
                <span className="px-3 py-1 rounded-xl bg-rose-600/95 backdrop-blur-sm text-white text-xs font-bold shadow-md">
                  Save ₹{savings}
                </span>
              )}
            </div>

            {/* Rating Pill */}
            <div className="absolute bottom-4 right-4 px-3.5 py-1.5 rounded-full bg-stone-900/90 backdrop-blur-md text-amber-400 text-sm font-bold flex items-center gap-1.5 shadow-xl border border-stone-800">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{food.rating ? food.rating.toFixed(1) : '4.8'}</span>
              <span className="text-xs text-stone-400 font-normal">
                ({food.numReviews || 0} reviews)
              </span>
            </div>
          </TiltedCard>

          {/* Highlights Banner */}
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80 flex flex-col items-center justify-center gap-1">
              <Clock className="w-4 h-4 text-brand-600" />
              <span className="font-bold text-stone-900">{food.preparationTime || 20} mins</span>
              <span className="text-[10px] text-stone-400">Fresh Cook Time</span>
            </div>
            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80 flex flex-col items-center justify-center gap-1">
              <Flame className="w-4 h-4 text-amber-500" />
              <span className="font-bold text-stone-900 capitalize">{food.spiceLevel || 'Medium'}</span>
              <span className="text-[10px] text-stone-400">Spice Heat Level</span>
            </div>
            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80 flex flex-col items-center justify-center gap-1">
              <Leaf className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-stone-900 uppercase text-[11px]">{food.foodType || 'Veg'}</span>
              <span className="text-[10px] text-stone-400">Dietary Style</span>
            </div>
          </div>
        </div>

        {/* Right 6 cols: Culinary Specs & Action Card */}
        <div className="lg:col-span-6 space-y-6">
          <AnimatedContent delay={0.1}>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200/60">
                  {food.category?.name || 'Signature Special'}
                </span>
                {food.tags?.map((t, idx) => (
                  <span key={idx} className="text-[11px] text-stone-500 font-semibold bg-stone-100 px-2 py-0.5 rounded-md">
                    #{t}
                  </span>
                ))}
              </div>

              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 leading-tight">
                {food.name}
              </h1>

              <p className="text-stone-600 text-sm sm:text-base leading-relaxed pt-1">
                {food.description}
              </p>
            </div>
          </AnimatedContent>

          {/* Pricing Box */}
          <AnimatedContent delay={0.2}>
            <div className="p-5 rounded-3xl bg-stone-900 text-white shadow-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-stone-400 font-medium block">Portion Price</span>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-3xl sm:text-4xl font-bold font-sans text-amber-300">
                    ₹{currentPrice}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm text-stone-400 line-through">
                      ₹{food.price}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    food.isAvailable !== false
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {food.isAvailable !== false ? '● Fresh in Kitchen' : '● Sold Out Today'}
                </span>
                <span className="text-[10px] text-stone-400 block mt-1">Inclusive of all restaurant taxes</span>
              </div>
            </div>
          </AnimatedContent>

          {/* Nutritional Profile Grid */}
          {food.nutrition && (
            <AnimatedContent delay={0.3}>
              <div className="space-y-2 p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Nutritional Profile (Approx. Per Serving)</span>
                </h4>
                <div className="grid grid-cols-4 gap-2.5 text-center">
                  <div className="p-2.5 rounded-xl bg-white border border-stone-200 shadow-sm">
                    <span className="block text-sm font-bold text-stone-900">{food.nutrition.calories || 320}</span>
                    <span className="text-[10px] text-stone-400 uppercase font-semibold">Calories</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-stone-200 shadow-sm">
                    <span className="block text-sm font-bold text-stone-900">{food.nutrition.protein || 12}g</span>
                    <span className="text-[10px] text-stone-400 uppercase font-semibold">Protein</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-stone-200 shadow-sm">
                    <span className="block text-sm font-bold text-stone-900">{food.nutrition.carbs || 45}g</span>
                    <span className="text-[10px] text-stone-400 uppercase font-semibold">Carbs</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-stone-200 shadow-sm">
                    <span className="block text-sm font-bold text-stone-900">{food.nutrition.fats || 10}g</span>
                    <span className="text-[10px] text-stone-400 uppercase font-semibold">Fats</span>
                  </div>
                </div>
              </div>
            </AnimatedContent>
          )}

          {/* Key Ingredients */}
          {food.ingredients && food.ingredients.length > 0 && (
            <AnimatedContent delay={0.4}>
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Key Fresh Ingredients & Aromatics
                </h4>
                <div className="flex flex-wrap gap-2">
                  {food.ingredients.map((ing, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl bg-stone-100 text-stone-800 text-xs font-semibold border border-stone-200"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            </AnimatedContent>
          )}

          {/* Special Instructions Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700">
              Kitchen Instructions (Optional)
            </label>
            <input
              type="text"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Medium spice, no onions, extra green chutney..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-brand-500 transition-all"
            />
          </div>

          {/* Quantity & Add to Cart CTA */}
          <div className="pt-3 flex items-center gap-4">
            <div className="flex items-center gap-3 bg-stone-100 rounded-2xl p-1.5 border border-stone-200">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-xl bg-white hover:bg-stone-200 shadow-sm flex items-center justify-center text-stone-800 font-bold transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-base font-bold w-6 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-xl bg-white hover:bg-stone-200 shadow-sm flex items-center justify-center text-stone-800 font-bold transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={food.isAvailable === false}
              className={`flex-1 py-4 px-6 rounded-2xl font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 ${
                food.isAvailable === false
                  ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-brand-600 via-amber-600 to-brand-600 hover:from-brand-500 hover:to-amber-500 text-white shadow-brand-500/25 hover:shadow-glow'
              }`}
            >
              {addedAnimation ? (
                <>
                  <CheckCircle2 className="w-5 h-5 animate-bounce" />
                  <span>Added to Order Basket!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  <span>
                    {food.isAvailable !== false
                      ? `Add to Cart • ₹${currentPrice * quantity}`
                      : 'Dish Currently Sold Out'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="pt-12 border-t border-stone-200 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              Diner Reviews & Ratings
            </h3>
            <p className="text-xs sm:text-sm text-stone-500">
              Verified customer feedback on taste, authenticity, and presentation
            </p>
          </div>

          <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-200/80 text-amber-900 text-sm font-bold">
            <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            <span>{food.rating ? food.rating.toFixed(1) : '4.8'} / 5.0</span>
            <span className="text-xs text-amber-700 font-normal">({food.reviews?.length || 0} reviews)</span>
          </div>
        </div>

        {/* Post a Review Box */}
        <form
          onSubmit={handleReviewSubmit}
          className="p-6 rounded-3xl bg-stone-50 border border-stone-200/80 shadow-sm space-y-4 max-w-2xl"
        >
          <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-brand-600" />
            <span>Share Your Dining Experience</span>
          </h4>

          <div className="space-y-1">
            <label className="text-xs text-stone-600 font-semibold">Your Rating</label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-stone-700 ml-2">{rating} Star{rating > 1 ? 's' : ''}</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-stone-600 font-semibold">Your Review Comment</label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you love about this dish? (e.g. rich aroma, perfect spice balance, tender texture)..."
              className="w-full p-3 rounded-2xl bg-white border border-stone-200 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-brand-500 resize-none leading-relaxed"
            ></textarea>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submittingReview}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {submittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Submit Review</span>
            </button>
          </div>
        </form>

        {/* Reviews List */}
        {food.reviews && food.reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {food.reviews.map((rev) => (
              <AnimatedContent key={rev._id} delay={0.05}>
                <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-sm space-y-3 h-full flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={rev.customerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                          alt={rev.customerName}
                          className="w-9 h-9 rounded-full object-cover border border-stone-200"
                        />
                        <div>
                          <h4 className="text-sm font-bold text-stone-900">{rev.customerName || 'Diner'}</h4>
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
                        {[...Array(rev.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed italic">
                      "{rev.comment}"
                    </p>
                  </div>
                </div>
              </AnimatedContent>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-stone-50 rounded-3xl border border-stone-200/80 text-stone-500 text-sm">
            No customer reviews yet. Be the first to order and review this dish!
          </div>
        )}
      </div>

      {/* Recommended / Related Dishes */}
      {relatedFoods.length > 0 && (
        <div className="pt-12 border-t border-stone-200 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-serif font-bold text-stone-900">
              You Might Also Relish
            </h3>
            <Link to="/menu" className="text-xs font-bold text-brand-600 hover:underline">
              Explore All Menu →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedFoods.map((relFood) => (
              <FoodCard key={relFood._id} food={relFood} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodDetails;
