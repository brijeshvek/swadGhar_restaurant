import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Flame,
  Star,
  RotateCcw,
  Sparkles,
  Utensils,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Layers,
} from 'lucide-react';
import api from '../services/api';
import FoodCard from '../components/common/FoodCard';
import { FoodCardSkeletonGrid } from '../components/common/FoodCardSkeleton';
import { BlurText, AnimatedContent, ShinyText } from '../components/animations';
import { useTranslation } from '../context/LanguageContext';

const Menu = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [foodType, setFoodType] = useState('all');
  const [spiceLevel, setSpiceLevel] = useState('all');
  const [priceRange, setPriceRange] = useState(2000);
  const [sortOption, setSortOption] = useState('popular');
  const [cuisineFilter, setCuisineFilter] = useState('all');

  // Customer Pagination: 12 dishes per page
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Fetch Categories on Mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        const items = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        if (items.length > 0) {
          setCategories(items);
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

  // Reset page to 1 when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, foodType, spiceLevel, sortOption, priceRange, cuisineFilter]);

  const fetchFilteredFoods = async () => {
    setLoading(true);
    try {
      const params = {
        limit: 500, // Load all items to display complete database catalog
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: searchQuery.trim() !== '' ? searchQuery.trim() : undefined,
        foodType: foodType !== 'all' ? foodType : undefined,
        spiceLevel: spiceLevel !== 'all' ? spiceLevel : undefined,
        maxPrice: priceRange,
        sort: sortOption,
      };

      const res = await api.get('/foods', { params });
      if (res?.data) {
        let items = res.data;
        // Apply client-side cuisine filter if chosen and no specific category is selected
        if (cuisineFilter === 'gujarati' && selectedCategory === 'all') {
          items = items.filter(
            (f) =>
              f.category?.name?.toLowerCase().includes('gujarati') ||
              f.category?.name?.toLowerCase().includes('kathiyawadi')
          );
        } else if (cuisineFilter === 'punjabi' && selectedCategory === 'all') {
          items = items.filter((f) =>
            f.category?.name?.toLowerCase().includes('punjabi') ||
            f.category?.name?.toLowerCase().includes('paneer')
          );
        }

        setFoods(items);
        setFetchError(null);
      }
    } catch (err) {
      console.error('Error fetching foods:', err);
      setFetchError(err.message || 'Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFilteredFoods();
    }, 200);

    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery, foodType, spiceLevel, sortOption, priceRange, cuisineFilter]);

  const gujaratiCategories = useMemo(() => {
    return categories.filter(
      (c) =>
        c.name?.toLowerCase().includes('gujarati') ||
        c.name?.toLowerCase().includes('kathiyawadi')
    );
  }, [categories]);

  const punjabiCategories = useMemo(() => {
    return categories.filter(
      (c) =>
        c.name?.toLowerCase().includes('punjabi') ||
        c.name?.toLowerCase().includes('paneer')
    );
  }, [categories]);

  // Filtered categories for pill buttons
  const visibleCategories = useMemo(() => {
    if (cuisineFilter === 'gujarati') return gujaratiCategories;
    if (cuisineFilter === 'punjabi') return punjabiCategories;
    return categories;
  }, [categories, cuisineFilter, gujaratiCategories, punjabiCategories]);

  const handleCategoryChange = (slug) => {
    setSelectedCategory(slug);
    if (slug === 'all') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: slug });
    }
  };

  const handleCuisineTabChange = (type) => {
    setCuisineFilter(type);
    setSelectedCategory('all');
    searchParams.delete('category');
    setSearchParams(searchParams);
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setCuisineFilter('all');
    setSearchQuery('');
    setFoodType('all');
    setSpiceLevel('all');
    setSortOption('popular');
    setPriceRange(1000);
    setSearchParams({});
  };

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(foods.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, foods.length);
  const paginatedFoods = foods.slice(startIndex, endIndex);

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Page Title */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-600 block">
          {t('brand.subTagline', 'Freshly Handcrafted Delicacies')}
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-stone-900">
          <BlurText text={t('menu.title', 'SwadGhar Royal Menu')} delay={0.05} animateBy="words" />
        </h1>
        <p className="text-stone-500 text-sm sm:text-base">
          {t('menu.subtitle', 'Browse through all authentic Gujarati & Punjabi categories and signature dishes.')}
        </p>
      </div>

      {/* Filter Control Bar */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white border border-stone-200/80 shadow-md space-y-5">
        
        {/* Row 1: Search & Category Select Dropdown & Sort */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="md:col-span-5 relative w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('menu.searchPlaceholder', 'Search dishes by name, ingredients, or spice...')}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-stone-400"
            />
          </div>

          {/* Dedicated Category Dropdown Select Option */}
          <div className="md:col-span-4 relative w-full">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-600 shrink-0 hidden sm:block" />
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 cursor-pointer transition-all"
              >
                <option value="all">🍽️ {t('menu.allCategories', 'All Categories')} ({categories.length})</option>
                <optgroup label={`── 🔶 GUJARATI (${gujaratiCategories.length}) ──`}>
                  {gujaratiCategories.map((c) => (
                    <option key={c._id} value={c.slug || c._id}>
                      {c.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label={`── 🔷 PUNJABI (${punjabiCategories.length}) ──`}>
                  {punjabiCategories.map((c) => (
                    <option key={c._id} value={c.slug || c._id}>
                      {c.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* Sort Selector */}
          <div className="md:col-span-3 flex items-center gap-2 justify-end">
            <SlidersHorizontal className="w-4 h-4 text-stone-500 shrink-0" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-medium text-stone-800 focus:outline-none focus:border-brand-500 cursor-pointer"
            >
              <option value="popular">{t('menu.sortPopular', 'Sort: Most Popular')}</option>
              <option value="rating">{t('menu.sortRating', 'Sort: Highest Rated')}</option>
              <option value="price_asc">{t('menu.sortPriceLowHigh', 'Price: Low to High')}</option>
              <option value="price_desc">{t('menu.sortPriceHighLow', 'Price: High to Low')}</option>
            </select>
          </div>
        </div>

        {/* Row 2: Quick Cuisine Tabs */}
        <div className="flex items-center gap-2 border-t border-stone-100 pt-3">
          <span className="text-xs font-bold text-stone-500 shrink-0">{t('common.filter', 'Cuisine')}:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCuisineTabChange('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                cuisineFilter === 'all'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {t('common.all', 'All')} ({categories.length})
            </button>
            <button
              onClick={() => handleCuisineTabChange('gujarati')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                cuisineFilter === 'gujarati'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60'
              }`}
            >
              🔶 Gujarati ({gujaratiCategories.length})
            </button>
            <button
              onClick={() => handleCuisineTabChange('punjabi')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                cuisineFilter === 'punjabi'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-orange-50 text-orange-800 hover:bg-orange-100 border border-orange-200/60'
              }`}
            >
              🔷 Punjabi ({punjabiCategories.length})
            </button>
          </div>
        </div>

        {/* Row 3: Categories Horizontal Scroller */}
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2 pt-1">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            {t('menu.allCategories', 'All Categories')} ({visibleCategories.length})
          </button>
          {visibleCategories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => handleCategoryChange(cat.slug || cat._id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat.slug || selectedCategory === cat._id
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20 ring-2 ring-brand-500/40'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Row 4: Secondary Filters: Food Type & Spice Level & Reset */}
        <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Dietary Type Filter */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-semibold text-stone-500">{t('menu.filterByDiet', 'Dietary')}:</span>
            {[
              { id: 'all', label: t('common.all', 'All') },
              { id: 'veg', label: t('common.pureVeg', 'Pure Veg') },
              { id: 'vegan', label: 'Vegan' },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setFoodType(type.id)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
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
            <span className="font-semibold text-stone-500">{t('menu.spiceLevel', 'Spice')}:</span>
            {[
              { id: 'all', label: t('common.all', 'Any') },
              { id: 'mild', label: t('menu.mild', 'Mild') },
              { id: 'medium', label: t('menu.medium', 'Medium') },
              { id: 'spicy', label: t('menu.spicy', 'Spicy') },
            ].map((sp) => (
              <button
                key={sp.id}
                onClick={() => setSpiceLevel(sp.id)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
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
            className="inline-flex items-center gap-1 text-stone-500 hover:text-brand-600 font-semibold transition-colors ml-auto cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('common.clearAll', 'Reset Filters')}</span>
          </button>
        </div>
      </div>

      {/* Catalog Status Bar */}
      <div className="flex items-center justify-between text-xs text-stone-500 px-1">
        <div>
          Showing <span className="font-bold text-stone-900">{foods.length === 0 ? 0 : startIndex + 1}</span> -{' '}
          <span className="font-bold text-stone-900">{endIndex}</span> of{' '}
          <span className="font-bold text-brand-600">{foods.length}</span> {t('common.items', 'dishes')}
          {selectedCategory !== 'all' && (
            <span className="ml-1 font-medium text-stone-700">
              in &quot;{categories.find((c) => c.slug === selectedCategory || c._id === selectedCategory)?.name || selectedCategory}&quot;
            </span>
          )}
        </div>
        {totalPages > 1 && (
          <div>
            Page <span className="font-bold text-stone-900">{currentPage}</span> /{' '}
            <span className="font-bold text-stone-900">{totalPages}</span>
          </div>
        )}
      </div>

      {/* Food Grid Section */}
      <div>
        {loading ? (
          <FoodCardSkeletonGrid count={itemsPerPage} />
        ) : paginatedFoods.length === 0 ? (
          fetchError ? (
            <div className="text-center py-16 px-4 bg-white rounded-3xl border border-amber-200 shadow-sm space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <RotateCcw className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-serif font-bold text-stone-900">
                Warming Up Live Server...
              </h3>
              <p className="text-stone-500 text-sm">
                Server is starting up. Please reload menu.
              </p>
              <button
                onClick={() => fetchFilteredFoods()}
                className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition-colors shadow-md inline-flex items-center gap-2 mx-auto cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t('common.refresh', 'Reload Menu Now')}</span>
              </button>
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-16 px-4 bg-white rounded-3xl border border-stone-200/80 shadow-sm space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-500 flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-serif font-bold text-stone-900">
                {t('menu.noDishesFound', 'No Dishes Found')}
              </h3>
              <p className="text-stone-500 text-sm">
                {t('menu.tryDifferentSearch', 'Try searching with another keyword or reset your filters.')}
              </p>
              <button
                onClick={handleResetFilters}
                className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm transition-colors shadow-md inline-flex items-center gap-2 mx-auto cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t('common.clearAll', 'Reset All Filters')}</span>
              </button>
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedFoods.map((food, idx) => (
              <AnimatedContent key={food._id} delay={idx * 0.03} className="h-full">
                <FoodCard food={food} />
              </AnimatedContent>
            ))}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && !loading && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-stone-200">
          <div className="text-xs text-stone-500">
            Showing <span className="font-bold text-stone-900">{startIndex + 1}</span> to{' '}
            <span className="font-bold text-stone-900">{endIndex}</span> of{' '}
            <span className="font-bold text-brand-600">{foods.length}</span> delicacies
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              title="First Page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:pointer-events-none text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{t('common.back', 'Previous')}</span>
            </button>

            <div className="flex items-center gap-1 mx-1">
              {getPageNumbers().map((p, idx) =>
                p === '...' ? (
                  <span key={idx} className="px-2 text-stone-400 text-xs">...</span>
                ) : (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(p)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentPage === p
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-500/30'
                        : 'text-stone-700 hover:bg-stone-100 border border-stone-200'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:pointer-events-none text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              title="Last Page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;
