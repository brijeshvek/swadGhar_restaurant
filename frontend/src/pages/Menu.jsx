import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Flame,
  Star,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';
import FoodCard from '../components/common/FoodCard';

const Menu = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [foodType, setFoodType] = useState('all');
  const [spiceLevel, setSpiceLevel] = useState('all');
  const [sortOption, setSortOption] = useState('popular');
  const [priceRange, setPriceRange] = useState(1000);

  // Load Categories on Mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res?.data) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Update selectedCategory if URL changes
  useEffect(() => {
    const catFromUrl = searchParams.get('category');
    if (catFromUrl) {
      setSelectedCategory(catFromUrl);
    }
  }, [searchParams]);

  // Fetch Foods with active filters
  useEffect(() => {
    const fetchFilteredFoods = async () => {
      setLoading(true);
      try {
        const params = {
          limit: 50,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          search: searchQuery.trim() !== '' ? searchQuery.trim() : undefined,
          foodType: foodType !== 'all' ? foodType : undefined,
          spiceLevel: spiceLevel !== 'all' ? spiceLevel : undefined,
          maxPrice: priceRange,
          sort: sortOption,
        };

        const res = await api.get('/foods', { params });
        if (res?.data) {
          setFoods(res.data);
        }
      } catch (err) {
        console.error('Error fetching filtered menu:', err);
        setFoods([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchFilteredFoods();
    }, 250); // Debounce search

    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery, foodType, spiceLevel, sortOption, priceRange]);

  const handleCategoryChange = (slug) => {
    setSelectedCategory(slug);
    if (slug === 'all') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: slug });
    }
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setFoodType('all');
    setSpiceLevel('all');
    setSortOption('popular');
    setPriceRange(1000);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fade-in">
      {/* Page Title */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-600 block">
          Freshly Handcrafted
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-stone-900">
          Our Culinary Repertoire
        </h1>
        <p className="text-stone-500 text-sm sm:text-base">
          Browse through our rich selection of authentic appetizers, thalis, gravies, and royal desserts.
        </p>
      </div>

      {/* Filter Control Bar */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white border border-stone-200/80 shadow-sm space-y-4">
        {/* Search & Sort Row */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes (e.g. Paneer, Biryani, Thali)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-stone-400"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <SlidersHorizontal className="w-4 h-4 text-stone-500 shrink-0" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="py-2 px-3 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-medium text-stone-800 focus:outline-none focus:border-brand-500"
            >
              <option value="popular">Sort by: Most Popular</option>
              <option value="rating">Sort by: Highest Rated</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* Categories Pill Scroller */}
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2 pt-1">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => handleCategoryChange(cat.slug || cat._id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.slug || selectedCategory === cat._id
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Secondary Filters: Food Type & Spice Level */}
        <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Dietary Type Filter */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-semibold text-stone-500">Dietary:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'veg', label: 'Pure Veg' },
              { id: 'vegan', label: 'Vegan' },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setFoodType(type.id)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  foodType === type.id
                    ? 'bg-emerald-700 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Spice Level Filter */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-semibold text-stone-500">Spice:</span>
            {[
              { id: 'all', label: 'Any' },
              { id: 'mild', label: 'Mild' },
              { id: 'medium', label: 'Medium' },
              { id: 'spicy', label: 'Spicy' },
            ].map((sp) => (
              <button
                key={sp.id}
                onClick={() => setSpiceLevel(sp.id)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  spiceLevel === sp.id
                    ? 'bg-amber-600 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {sp.label}
              </button>
            ))}
          </div>

          {/* Reset Filters */}
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1 text-stone-500 hover:text-brand-600 font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Food Grid Section */}
      <div>
        {loading ? (
          /* Skeletons */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-white border border-stone-200 p-4 space-y-4 animate-pulse"
              >
                <div className="aspect-[4/3] bg-stone-200 rounded-xl"></div>
                <div className="h-4 bg-stone-200 rounded w-3/4"></div>
                <div className="h-3 bg-stone-200 rounded w-full"></div>
                <div className="h-8 bg-stone-200 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : foods.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-stone-200/80 shadow-sm space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-500 flex items-center justify-center mx-auto">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-serif font-bold text-stone-900">
              No Dishes Found
            </h3>
            <p className="text-stone-500 text-sm">
              We couldn’t find any delicacies matching your selected search or filter criteria.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-6 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-500 transition-colors shadow-md"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {foods.map((food) => (
              <FoodCard key={food._id} food={food} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
