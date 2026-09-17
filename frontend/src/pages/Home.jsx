import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Flame,
  Award,
  Clock,
  ShieldCheck,
  Calendar,
  ChefHat,
  Star,
  Quote,
  ChevronRight,
} from 'lucide-react';
import api from '../services/api';
import FoodCard from '../components/common/FoodCard';
import {
  BlurText,
  ShinyText,
  CountUp,
  AnimatedContent,
  SpotlightCard,
  Magnetic,
} from '../components/animations';

const Home = () => {
  const [featuredFoods, setFeaturedFoods] = useState([]);
  const [popularFoods, setPopularFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryTab, setCategoryTab] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [catsRes, featRes, popRes] = await Promise.all([
          api.get('/categories'),
          api.get('/foods/featured'),
          api.get('/foods/popular'),
        ]);

        if (catsRes?.data) setCategories(catsRes.data);
        if (featRes?.data) setFeaturedFoods(featRes.data);
        if (popRes?.data) setPopularFoods(popRes.data);
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const filteredCategories = categories.filter((cat) => {
    if (categoryTab === 'gujarati') {
      return (
        cat.name.toLowerCase().includes('gujarati') ||
        cat.name.toLowerCase().includes('kathiyawadi')
      );
    }
    if (categoryTab === 'punjabi') {
      return (
        cat.name.toLowerCase().includes('punjabi') ||
        cat.name.toLowerCase().includes('paneer')
      );
    }
    return true;
  });

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[88vh] flex items-center justify-center -mt-20 pt-28 pb-20 bg-stone-950 overflow-hidden text-stone-100">
        {/* Background Image with Dark Royal Vignette */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1920&q=80"
            alt="SwadGhar Fine Dining Ambience"
            className="w-full h-full object-cover opacity-20 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/85 to-stone-950/60"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,88,12,0.15)_0%,transparent_70%)]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Brand Welcome Pill */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-stone-900/90 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-semibold shadow-glow backdrop-blur-md">
            <span>Welcome to SwadGhar Fine Dining & Delicacies</span>
          </div>

          {/* Hero Heading */}
          <div className="space-y-5 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold text-white leading-[1.15] tracking-tight">
              A Symphony of{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-brand-500 to-amber-300">
                Authentic Flavors
              </span>{' '}
              & Royal Indian Heritage
            </h1>
            <p className="text-stone-300 text-base sm:text-xl font-normal max-w-2xl mx-auto leading-relaxed">
              Indulge in artisanal Gujarati thalis, succulent Punjabi curries, charcoal-fired tandoor specials, and handcrafted royal desserts.
            </p>
          </div>

          {/* Call To Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/menu"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-600 via-amber-600 to-brand-600 hover:from-brand-500 hover:to-amber-500 text-white font-bold text-base shadow-xl shadow-brand-500/25 hover:shadow-glow transition-all flex items-center justify-center gap-2.5 active:scale-95"
            >
              <span>Explore Our Menu</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/reservations"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-stone-900/90 hover:bg-stone-800 border border-stone-700 text-stone-200 hover:text-white font-semibold text-base backdrop-blur-md shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Calendar className="w-5 h-5 text-amber-400" />
              <span>Book a Table</span>
            </Link>
          </div>

          {/* Key Metrics Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-10 max-w-4xl mx-auto border-t border-stone-800/80">
            <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800/80 backdrop-blur-sm shadow-md">
              <span className="block text-2xl sm:text-3xl font-bold text-amber-400 font-serif">
                <CountUp to={100} suffix="%" duration={1.5} />
              </span>
              <span className="text-xs text-stone-400 font-medium">Pure Desi Ghee & Spices</span>
            </div>
            <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800/80 backdrop-blur-sm shadow-md">
              <span className="block text-2xl sm:text-3xl font-bold text-amber-400 font-serif">
                <CountUp to={4.9} duration={1.5} suffix=" ★" />
              </span>
              <span className="text-xs text-stone-400 font-medium">Customer Rating</span>
            </div>
            <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800/80 backdrop-blur-sm shadow-md">
              <span className="block text-2xl sm:text-3xl font-bold text-brand-400 font-serif">
                <CountUp to={30} suffix="+ Mins" duration={1.5} />
              </span>
              <span className="text-xs text-stone-400 font-medium">Fast Hot Delivery</span>
            </div>
            <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800/80 backdrop-blur-sm shadow-md">
              <span className="block text-2xl sm:text-3xl font-bold text-amber-400 font-serif">
                <CountUp to={25} suffix="+ Yrs" duration={1.5} />
              </span>
              <span className="text-xs text-stone-400 font-medium">Culinary Heritage</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedContent>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-600 block">
                Curated Palettes
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900">
                Explore by Category
              </h2>
            </div>

            {/* Cuisine Filter Tabs & View All Link */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setCategoryTab('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  categoryTab === 'all'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                All ({categories.length})
              </button>
              <button
                onClick={() => setCategoryTab('gujarati')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  categoryTab === 'gujarati'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60'
                }`}
              >
                🔶 Gujarati (15)
              </button>
              <button
                onClick={() => setCategoryTab('punjabi')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  categoryTab === 'punjabi'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-orange-50 text-orange-800 hover:bg-orange-100 border border-orange-200/60'
                }`}
              >
                🔷 Punjabi (16)
              </button>

              <Link
                to="/menu"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-brand-600 hover:text-brand-700 ml-2 group"
              >
                <span>Complete Menu</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </AnimatedContent>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-5">
          {filteredCategories.map((cat, idx) => (
            <AnimatedContent key={cat._id} delay={idx * 0.03}>
              <Link
                to={`/menu?category=${cat.slug || cat._id}`}
                className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-stone-900 shadow-sm hover:shadow-xl transition-all duration-300 block border border-stone-200/40"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-75 group-hover:opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent"></div>
                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                  <h3 className="font-serif font-bold text-xs sm:text-sm leading-tight group-hover:text-amber-300 transition-colors line-clamp-2">
                    {cat.name}
                  </h3>
                </div>
              </Link>
            </AnimatedContent>
          ))}
        </div>
      </section>

      {/* 3. FEATURED CHEF DELICACIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedContent>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-600 block flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Handpicked Masterpieces
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900">
                Chef’s Signature Dishes
              </h2>
            </div>
            <Link
              to="/menu"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              <span>See Full Menu</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </AnimatedContent>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredFoods.slice(0, 4).map((food, idx) => (
            <AnimatedContent key={food._id} delay={idx * 0.08} className="h-full">
              <FoodCard food={food} />
            </AnimatedContent>
          ))}
        </div>
      </section>

      {/* 4. HERITAGE & EXPERIENCE BANNER */}
      <section className="bg-stone-900 text-stone-100 py-16 sm:py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <AnimatedContent direction="horizontal" distance={40}>
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                The SwadGhar Tradition
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif font-bold text-gradient leading-tight">
                Where Ancient Recipes Meet Modern Hospitality
              </h2>
              <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                At SwadGhar, food is not merely prepared; it is honored. Every morning, our chefs hand-roast whole Gujarati cumin, coriander, and dry Kashmiri chilies. We simmer black lentils for 16 hours in copper vessels and bake artisan naans directly over coal tandoors.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-3">
                  <ChefHat className="w-6 h-6 text-brand-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Master Artisans</h4>
                    <p className="text-xs text-stone-400">Recipes perfected over 3 generations.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">FSSAI Gold Hygiene</h4>
                    <p className="text-xs text-stone-400">Sterilized contact-free packaging.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold shadow-md hover:shadow-glow transition-all"
                >
                  <span>Read Our Heritage Story</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </AnimatedContent>

          <AnimatedContent direction="horizontal" distance={-40}>
            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80"
                alt="Restaurant Ambience"
                className="rounded-3xl shadow-2xl object-cover h-64 w-full"
              />
              <img
                src="https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80"
                alt="Authentic Thali"
                className="rounded-3xl shadow-2xl object-cover h-64 w-full mt-6"
              />
            </div>
          </AnimatedContent>
        </div>
      </section>

      {/* 5. POPULAR BESTSELLERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedContent>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-600 block flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                Crowd Favorites
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900">
                Most Loved Delicacies
              </h2>
            </div>
            <Link
              to="/menu"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              <span>Explore All Dishes</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </AnimatedContent>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularFoods.slice(0, 4).map((food, idx) => (
            <AnimatedContent key={food._id} delay={idx * 0.08} className="h-full">
              <FoodCard food={food} />
            </AnimatedContent>
          ))}
        </div>
      </section>

      {/* 6. TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedContent>
          <div className="text-center space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600">
              Diner Reviews
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900">
              What Our Patrons Say
            </h2>
          </div>
        </AnimatedContent>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote: 'The Royal Gujarati Thali transported me straight back to grandmother’s kitchen. Unmatched authenticity and warm hospitable service.',
              initials: 'AS',
              name: 'Aarav Sharma',
              role: 'Food Connoisseur',
              color: 'bg-brand-100 text-brand-700',
            },
            {
              quote: 'Best Paneer Butter Masala and Garlic Naan in the city. Delivery was hot and prompt in under 30 minutes with leak-proof eco boxes.',
              initials: 'PM',
              name: 'Pooja Mehta',
              role: 'Regular Diner',
              color: 'bg-amber-100 text-amber-700',
            },
            {
              quote: 'We booked our anniversary banquet table online. The ambiance, royal lighting, and Dum Biryani handi were completely extraordinary!',
              initials: 'RD',
              name: 'Rohan Desai',
              role: 'Verified Table Guest',
              color: 'bg-emerald-100 text-emerald-700',
            },
          ].map((t, idx) => (
            <AnimatedContent key={idx} delay={idx * 0.1}>
              <SpotlightCard
                spotlightColor="rgba(217, 119, 6, 0.1)"
                className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/80 shadow-sm space-y-4 relative h-full flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <Quote className="w-8 h-8 text-brand-200" />
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-stone-600 italic leading-relaxed">
                    "{t.quote}"
                  </p>
                </div>
                <div className="pt-3 border-t border-stone-100 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full font-bold flex items-center justify-center text-sm ${t.color}`}>
                    {t.initials}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900">{t.name}</h4>
                    <p className="text-xs text-stone-400">{t.role}</p>
                  </div>
                </div>
              </SpotlightCard>
            </AnimatedContent>
          ))}
        </div>
      </section>

      {/* 7. TABLE RESERVATION CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <AnimatedContent>
          <div className="rounded-3xl bg-gradient-to-r from-stone-950 via-stone-900 to-brand-950 p-8 sm:p-12 text-white border border-stone-800 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center lg:text-left">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                Experience Fine Dining
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white">
                Reserve Your Table in Advance
              </h2>
              <p className="text-stone-300 text-sm sm:text-base max-w-xl">
                Planning a family feast, romantic dinner or business luncheon? Secure your table instantly with zero booking fee.
              </p>
            </div>
            <Magnetic strength={0.25}>
              <Link
                to="/reservations"
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 hover:to-amber-500 text-white font-bold text-base shadow-xl hover:shadow-glow transition-all shrink-0 active:scale-95"
              >
                Book Table Now
              </Link>
            </Magnetic>
          </div>
        </AnimatedContent>
      </section>
    </div>
  );
};

export default Home;
