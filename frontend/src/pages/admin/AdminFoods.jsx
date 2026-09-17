import React, { useEffect, useState } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Star,
  Search,
  Flame,
  Clock,
  X,
  Image as ImageIcon,
  Loader2,
  Info,
  Sparkles,
  Eye,
  Activity,
  Upload,
  Camera,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { AnimatedContent, SpotlightCard } from '../../components/animations';
import { convertFileToBase64 } from '../../utils/imageUtils';

const FOOD_PRESET_IMAGES = [
  { name: 'Paneer Butter Masala', url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80' },
  { name: 'Royal Dum Biryani', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80' },
  { name: 'Dal Tadka & Ghee Rice', url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80' },
  { name: 'Kathiyawadi Sev Tameta', url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80' },
  { name: 'Gulab Jamun with Rabdi', url: 'https://images.unsplash.com/photo-1589301773859-bb436d46d5c6?auto=format&fit=crop&w=800&q=80' },
  { name: 'Butter Garlic Naan', url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80' },
];

const AdminFoods = () => {
  const { isAdmin } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Pagination state (20 dishes per page)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState(null);

  // View Details Modal State
  const [viewingFood, setViewingFood] = useState(null);

  // Full Form Data with all Schema Fields
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    discountPrice: '0',
    image: '',
    foodType: 'veg',
    spiceLevel: 'medium',
    preparationTime: 20,
    isAvailable: true,
    isPopular: false,
    isFeatured: false,
    ingredients: '',
    calories: 320,
    protein: 12,
    carbs: 45,
    fats: 10,
    tags: '',
  });

  const fetchData = async () => {
    try {
      const [foodsRes, catsRes] = await Promise.all([
        api.get('/foods?limit=1000'),
        api.get('/categories?includeInactive=true'),
      ]);
      if (foodsRes?.data) setFoods(foodsRes.data);
      if (catsRes?.data) setCategories(catsRes.data);
    } catch (err) {
      console.error('Error fetching foods & categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Reset page to 1 when filter or search or itemsPerPage changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterCategory, itemsPerPage]);

  const handleOpenAddModal = () => {
    setEditingFood(null);
    setFormData({
      name: '',
      description: '',
      category: categories[0]?._id || '',
      price: '',
      discountPrice: '0',
      image: FOOD_PRESET_IMAGES[0].url,
      foodType: 'veg',
      spiceLevel: 'medium',
      preparationTime: 20,
      isAvailable: true,
      isPopular: false,
      isFeatured: false,
      ingredients: 'Desi Ghee, Pure Paneer, Hand-Ground Spices, Kasuri Methi',
      calories: 350,
      protein: 14,
      carbs: 38,
      fats: 16,
      tags: 'Chef Signature, Fresh Ingredients',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (food) => {
    setEditingFood(food);
    setFormData({
      name: food.name || '',
      description: food.description || '',
      category: food.category?._id || food.category || categories[0]?._id || '',
      price: food.price || '',
      discountPrice: food.discountPrice || 0,
      image: food.image || FOOD_PRESET_IMAGES[0].url,
      foodType: food.foodType || 'veg',
      spiceLevel: food.spiceLevel || 'medium',
      preparationTime: food.preparationTime || 20,
      isAvailable: food.isAvailable !== undefined ? food.isAvailable : true,
      isPopular: !!food.isPopular,
      isFeatured: !!food.isFeatured,
      ingredients: Array.isArray(food.ingredients) ? food.ingredients.join(', ') : (food.ingredients || ''),
      calories: food.nutrition?.calories || 0,
      protein: food.nutrition?.protein || 0,
      carbs: food.nutrition?.carbs || 0,
      fats: food.nutrition?.fats || 0,
      tags: Array.isArray(food.tags) ? food.tags.join(', ') : (food.tags || ''),
    });
    setModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      showError('File size is too large. Please select an image under 15MB.');
      return;
    }

    setUploadingImage(true);

    try {
      // Convert file into optimized Base64 Data URI
      const base64Data = await convertFileToBase64(file, 1200, 0.85);
      setFormData((prev) => ({ ...prev, image: base64Data }));
      showSuccess('Image converted to Base64 and preview updated!');
    } catch (err) {
      console.error('Base64 conversion failed:', err);
      showError('Failed to process image. Please try another image file.');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleSaveFood = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) {
      showError('Please provide dish name and valid price.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        price: Number(formData.price),
        discountPrice: Number(formData.discountPrice) || 0,
        image: formData.image.trim(),
        foodType: formData.foodType,
        spiceLevel: formData.spiceLevel,
        preparationTime: Number(formData.preparationTime) || 20,
        isAvailable: formData.isAvailable,
        isPopular: formData.isPopular,
        isFeatured: formData.isFeatured,
        ingredients: formData.ingredients.split(',').map(s => s.trim()).filter(Boolean),
        tags: formData.tags.split(',').map(s => s.trim()).filter(Boolean),
        nutrition: {
          calories: Number(formData.calories) || 0,
          protein: Number(formData.protein) || 0,
          carbs: Number(formData.carbs) || 0,
          fats: Number(formData.fats) || 0,
        },
      };

      if (editingFood) {
        await api.put(`/foods/${editingFood._id}`, payload);
        showSuccess(`Updated dish '${formData.name}' successfully!`);
      } else {
        await api.post('/foods', payload);
        showSuccess(`Created dish '${formData.name}' successfully!`);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      showError(err.message || 'Failed to save food dish.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFood = async (id, name) => {
    if (!window.confirm(`Delete dish '${name}' permanently?`)) return;
    try {
      await api.delete(`/foods/${id}`);
      showSuccess(`Dish '${name}' deleted.`);
      fetchData();
    } catch (err) {
      showError(err.message || 'Failed to delete food.');
    }
  };

  const handleToggleAvailability = async (id) => {
    try {
      const res = await api.patch(`/foods/${id}/availability`);
      showSuccess(res.message);
      fetchData();
    } catch (err) {
      showError(err.message || 'Failed to toggle availability.');
    }
  };

  const filteredFoods = foods.filter((f) => {
    const matchSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.category?.name?.toLowerCase().includes(search.toLowerCase()) ||
      f.description?.toLowerCase().includes(search.toLowerCase()) ||
      (Array.isArray(f.tags) && f.tags.some(t => t.toLowerCase().includes(search.toLowerCase())));
    const matchCat = filterCategory === 'all' || f.category?._id === filterCategory || f.category?.slug === filterCategory;
    return matchSearch && matchCat;
  });

  const totalPages = Math.max(1, Math.ceil(filteredFoods.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredFoods.length);
  const paginatedFoods = filteredFoods.slice(startIndex, endIndex);

  // Generate page numbers to display with smart ellipsis
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
    <div className="space-y-6 text-stone-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white flex items-center gap-3">
            <span>Food Menu Catalog</span>
            <span className="px-3 py-0.5 rounded-full bg-brand-500/20 text-brand-400 text-xs font-sans font-bold border border-brand-500/30">
              {foods.length} Total Dishes
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-400">
            Manage complete dish profiles, dietary specifications, ingredient tags, prices, and stock
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg shadow-brand-500/20 hover:shadow-glow transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Dish</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dishes by name, ingredients, or spices..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400 font-semibold shrink-0">Category:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="py-2 px-3 rounded-xl bg-stone-900 border border-stone-800 text-xs text-white focus:outline-none focus:border-brand-500 max-w-[200px]"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400 font-semibold shrink-0">Per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="py-2 px-2.5 rounded-xl bg-stone-900 border border-stone-800 text-xs text-white focus:outline-none focus:border-brand-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Foods Table */}
      <div className="rounded-3xl bg-stone-950 border border-stone-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-stone-900 border-b border-stone-800 text-[11px] font-bold uppercase tracking-wider text-stone-400">
              <tr>
                <th className="py-3.5 px-4 text-center w-12">#</th>
                <th className="py-3.5 px-4">Dish</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price / Disc.</th>
                <th className="py-3.5 px-4">Diet & Spice</th>
                <th className="py-3.5 px-4">Prep Time</th>
                <th className="py-3.5 px-4">Availability</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-stone-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-500" />
                    <span>Loading authentic dishes...</span>
                  </td>
                </tr>
              ) : paginatedFoods.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-stone-400 space-y-2">
                    <UtensilsCrossed className="w-8 h-8 text-stone-600 mx-auto" />
                    <p className="font-semibold text-sm text-stone-300">No dishes found</p>
                    <p className="text-xs text-stone-500">Try changing your search keywords or category filters</p>
                  </td>
                </tr>
              ) : (
                paginatedFoods.map((food, index) => {
                  const dishNumber = startIndex + index + 1;
                  return (
                    <tr key={food._id} className="hover:bg-stone-900/50 transition-colors">
                      {/* Sequential Dish Number Count */}
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center justify-center min-w-[32px] h-8 px-1.5 rounded-xl bg-stone-900 border border-stone-800 text-amber-400 font-mono font-bold text-xs shadow-xs">
                          #{dishNumber}
                        </span>
                      </td>

                      {/* Dish */}
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          src={food.image}
                          alt={food.name}
                          className="w-12 h-12 rounded-xl object-cover bg-stone-900 shrink-0"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = FOOD_PRESET_IMAGES[0].url;
                          }}
                        />
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-bold text-white text-sm">{food.name}</h4>
                            {food.isPopular && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold border border-amber-500/30">
                                ★ Bestseller
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-stone-400 flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {food.rating ? food.rating.toFixed(1) : '4.8'} ({food.numReviews || 0} reviews)
                          </span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 font-semibold text-brand-400">
                        {food.category?.name || 'Unassigned'}
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-white text-sm font-sans block">₹{food.price}</span>
                        {food.discountPrice > 0 && (
                          <span className="text-[10px] text-emerald-400 font-semibold">
                            Sale: ₹{food.discountPrice}
                          </span>
                        )}
                      </td>

                      {/* Dietary & Spice */}
                      <td className="py-3 px-4 space-y-1">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            food.foodType === 'veg'
                              ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/40'
                              : food.foodType === 'vegan'
                              ? 'bg-teal-900/60 text-teal-300 border border-teal-700/40'
                              : 'bg-rose-900/60 text-rose-300 border border-rose-700/40'
                          }`}
                        >
                          {food.foodType}
                        </span>
                        <span className="text-[10px] text-amber-400 block capitalize font-medium flex items-center gap-1">
                          <Flame className="w-3 h-3 text-amber-500" />
                          {food.spiceLevel}
                        </span>
                      </td>

                      {/* Preparation Time */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-stone-300">
                          <Clock className="w-3.5 h-3.5 text-stone-500" />
                          <span>{food.preparationTime || 20}m</span>
                        </span>
                      </td>

                      {/* Availability Toggle */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleAvailability(food._id)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-colors flex items-center gap-1 ${
                            food.isAvailable
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {food.isAvailable ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          <span>{food.isAvailable ? 'In Stock' : 'Sold Out'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right space-x-1.5">
                        <button
                          onClick={() => setViewingFood(food)}
                          className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white transition-colors"
                          title="View Complete Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {isAdmin && (
                          <>
                            <button
                              onClick={() => handleOpenEditModal(food)}
                              className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-brand-400 transition-colors"
                              title="Edit Dish"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteFood(food._id, food.name)}
                              className="p-1.5 rounded-lg bg-stone-900 hover:bg-rose-900/40 text-stone-300 hover:text-rose-400 transition-colors"
                              title="Delete Dish"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer Controls */}
        {filteredFoods.length > 0 && (
          <div className="p-4 bg-stone-900/80 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Info Range */}
            <div className="text-xs text-stone-400">
              Showing <span className="font-bold text-white">{filteredFoods.length === 0 ? 0 : startIndex + 1}</span> to{' '}
              <span className="font-bold text-white">{endIndex}</span> of{' '}
              <span className="font-bold text-amber-400">{filteredFoods.length}</span> dishes
              {filteredFoods.length !== foods.length && (
                <span className="text-stone-500"> (filtered from {foods.length} total)</span>
              )}
            </div>

            {/* Page Buttons */}
            <div className="flex items-center gap-1.5">
              {/* First Page */}
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-400 hover:text-white disabled:opacity-40 disabled:hover:text-stone-400 transition-colors"
                title="First Page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              {/* Prev Page */}
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-400 hover:text-white disabled:opacity-40 disabled:hover:text-stone-400 transition-colors"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Number Buttons */}
              <div className="flex items-center gap-1">
                {getPageNumbers().map((num, idx) => {
                  if (num === '...') {
                    return (
                      <span key={`dots-${idx}`} className="px-2 text-stone-500 text-xs">
                        ...
                      </span>
                    );
                  }
                  return (
                    <button
                      key={`page-${num}`}
                      onClick={() => setCurrentPage(num)}
                      className={`min-w-[32px] h-8 px-2 rounded-xl text-xs font-bold transition-all ${
                        currentPage === num
                          ? 'bg-gradient-to-r from-brand-600 to-amber-600 text-white shadow-md shadow-brand-500/20 scale-105 border border-amber-500/40'
                          : 'bg-stone-900 border border-stone-800 text-stone-400 hover:text-white hover:bg-stone-800'
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>

              {/* Next Page */}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-400 hover:text-white disabled:opacity-40 disabled:hover:text-stone-400 transition-colors"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Last Page */}
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-400 hover:text-white disabled:opacity-40 disabled:hover:text-stone-400 transition-colors"
                title="Last Page"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Dish Full Modal */}
      {modalOpen && (
        <div
          onClick={() => !submitting && setModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-3xl w-full max-h-[92vh] overflow-y-auto rounded-3xl bg-stone-900 border border-stone-800 p-6 sm:p-8 space-y-6 shadow-2xl relative"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center border border-brand-500/30">
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
                <h3 className="text-xl font-serif font-bold text-white">
                  {editingFood ? `Edit Dish: ${editingFood.name}` : 'Add New Culinary Delicacy'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                disabled={submitting}
                className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveFood} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-stone-300">Dish Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Paneer Tikka Angara"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-brand-500 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-300">Category *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-brand-500 text-xs"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-300">Standard Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="350"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-brand-500 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-300">Discount Price (₹, optional)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-brand-500 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-300">Dietary Specification</label>
                  <select
                    value={formData.foodType}
                    onChange={(e) => setFormData({ ...formData, foodType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-brand-500 text-xs"
                  >
                    <option value="veg">Pure Veg (Desi Ghee)</option>
                    <option value="vegan">Vegan (Plant Based)</option>
                    <option value="non-veg">Non-Veg</option>
                    <option value="egg">Contains Egg</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-300">Spice Heat Level</label>
                  <select
                    value={formData.spiceLevel}
                    onChange={(e) => setFormData({ ...formData, spiceLevel: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-brand-500 text-xs"
                  >
                    <option value="mild">Mild (Subtle Spices)</option>
                    <option value="medium">Medium (Balanced Heat)</option>
                    <option value="spicy">Spicy (Hot & Zesty)</option>
                    <option value="extra-spicy">Extra Spicy (Fiery Masala)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-300">Preparation Time (Minutes)</label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={formData.preparationTime}
                    onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-brand-500 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-300">Tags / Badges (Comma separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="Chef Special, Pure Ghee, Jain Available"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-brand-500 text-xs"
                  />
                </div>
              </div>

              {/* Image Upload, URL & Presets */}
              <div className="space-y-3 pt-1 p-3.5 rounded-2xl bg-stone-950/60 border border-stone-800/80">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-stone-200 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-amber-400" />
                    <span>Dish Food Photography *</span>
                  </label>
                  <span className="text-[10px] text-amber-400/80 font-medium">Upload File or Paste Link</span>
                </div>

                {/* Upload Button + File Input + Image Preview */}
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <div className="w-20 h-16 rounded-xl bg-stone-900 border border-stone-800 overflow-hidden shrink-0 flex items-center justify-center relative shadow-inner">
                    {formData.image ? (
                      <img
                        src={formData.image}
                        alt="Dish Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = FOOD_PRESET_IMAGES[0].url;
                        }}
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-stone-600" />
                    )}
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-brand-600 hover:from-amber-500 hover:to-brand-500 text-white font-bold text-xs shadow-md transition-all shrink-0 active:scale-95">
                        {uploadingImage ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>{uploadingImage ? 'Uploading Image...' : 'Choose File / Upload Image'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[11px] text-stone-500 hidden sm:inline">or paste direct image URL below:</span>
                    </div>

                    <input
                      type="text"
                      required
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://images.unsplash.com/... or /uploads/..."
                      className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white focus:outline-none focus:border-brand-500 text-xs font-mono placeholder:text-stone-600"
                    />
                  </div>
                </div>

                {/* Presets */}
                <div className="pt-1 border-t border-stone-900">
                  <span className="text-[10px] text-stone-400 font-semibold block mb-1">
                    ✨ Or Quick Select Classic Dish Preset:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {FOOD_PRESET_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormData({ ...formData, image: preset.url })}
                        className={`p-1.5 rounded-lg border text-left text-[10px] truncate transition-colors flex items-center gap-1.5 ${
                          formData.image === preset.url
                            ? 'bg-brand-600/30 border-brand-500 text-amber-300'
                            : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        <img src={preset.url} alt="" className="w-4 h-4 rounded object-cover" />
                        <span className="truncate">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="font-bold text-stone-300">Culinary Description *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe authentic preparation method, fragrant spices, rich gravy consistency and serving style..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-brand-500 resize-none text-xs leading-relaxed"
                ></textarea>
              </div>

              {/* Ingredients */}
              <div className="space-y-1.5">
                <label className="font-bold text-stone-300">Key Fresh Ingredients (Comma separated)</label>
                <input
                  type="text"
                  value={formData.ingredients}
                  onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                  placeholder="Paneer, Desi Ghee, Kasuri Methi, Kashmiri Chili, Fresh Cream"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-brand-500 text-xs"
                />
              </div>

              {/* Nutritional Profile */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-stone-950 border border-stone-800/80">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
                  🥗 Nutritional Profile (Per Serving)
                </span>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-stone-400 font-semibold block mb-1">Calories (kcal)</label>
                    <input
                      type="number"
                      value={formData.calories}
                      onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-400 font-semibold block mb-1">Protein (g)</label>
                    <input
                      type="number"
                      value={formData.protein}
                      onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-400 font-semibold block mb-1">Carbs (g)</label>
                    <input
                      type="number"
                      value={formData.carbs}
                      onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-400 font-semibold block mb-1">Fats (g)</label>
                    <input
                      type="number"
                      value={formData.fats}
                      onChange={(e) => setFormData({ ...formData, fats: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    className="rounded bg-stone-950 border-stone-800 text-brand-600 focus:ring-0"
                  />
                  <span className="text-stone-300 font-semibold">In Stock (Available to Order)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={formData.isPopular}
                    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                    className="rounded bg-stone-950 border-stone-800 text-brand-600 focus:ring-0"
                  />
                  <span className="text-stone-300 font-semibold">Mark as Bestseller</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded bg-stone-950 border-stone-800 text-brand-600 focus:ring-0"
                  />
                  <span className="text-stone-300 font-semibold">Homepage Signature Feature</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 hover:to-amber-500 text-white font-bold shadow-lg shadow-brand-500/20 hover:shadow-glow transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingFood ? 'Update Dish' : 'Publish Dish'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Complete Dish Details Modal */}
      {viewingFood && (
        <div
          onClick={() => setViewingFood(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-xl w-full max-h-[90vh] overflow-y-auto rounded-3xl bg-stone-900 border border-stone-800 p-6 sm:p-8 space-y-6 shadow-2xl relative"
          >
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-400">
                {viewingFood.category?.name || 'Signature Dish'}
              </span>
              <button
                onClick={() => setViewingFood(null)}
                className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-stone-950">
              <img src={viewingFood.image} alt={viewingFood.name} className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3 flex gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase backdrop-blur-md border ${
                    viewingFood.foodType === 'veg'
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30'
                      : 'bg-rose-950/80 text-rose-300 border-rose-500/30'
                  }`}
                >
                  {viewingFood.foodType}
                </span>
                {viewingFood.isPopular && (
                  <span className="px-2.5 py-0.5 rounded-lg bg-amber-500 text-white text-xs font-bold shadow-md">
                    Bestseller
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-2xl font-serif font-bold text-white">{viewingFood.name}</h2>
                <div className="text-right">
                  <span className="text-2xl font-bold text-white font-sans">₹{viewingFood.price}</span>
                  {viewingFood.discountPrice > 0 && (
                    <span className="text-xs text-emerald-400 block font-semibold">Offer: ₹{viewingFood.discountPrice}</span>
                  )}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">{viewingFood.description}</p>
            </div>

            {/* Nutrition & Specs */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800">
                <span className="block font-bold text-white">{viewingFood.nutrition?.calories || 0}</span>
                <span className="text-[10px] text-stone-400">Calories</span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800">
                <span className="block font-bold text-white">{viewingFood.nutrition?.protein || 0}g</span>
                <span className="text-[10px] text-stone-400">Protein</span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800">
                <span className="block font-bold text-white">{viewingFood.nutrition?.carbs || 0}g</span>
                <span className="text-[10px] text-stone-400">Carbs</span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800">
                <span className="block font-bold text-white">{viewingFood.nutrition?.fats || 0}g</span>
                <span className="text-[10px] text-stone-400">Fats</span>
              </div>
            </div>

            {/* Ingredients */}
            {viewingFood.ingredients && viewingFood.ingredients.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">Ingredients</span>
                <div className="flex flex-wrap gap-1.5">
                  {viewingFood.ingredients.map((ing, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-stone-800 text-stone-300 text-xs">
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-stone-800">
              <button
                onClick={() => setViewingFood(null)}
                className="px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFoods;
