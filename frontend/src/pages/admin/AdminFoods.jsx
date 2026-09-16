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
  X,
} from 'lucide-react';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

const AdminFoods = () => {
  const { isAdmin } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    discountPrice: '',
    image: '',
    foodType: 'veg',
    spiceLevel: 'medium',
    preparationTime: 20,
    isAvailable: true,
    isPopular: false,
    isFeatured: false,
    ingredients: '',
  });

  const fetchData = async () => {
    try {
      const [foodsRes, catsRes] = await Promise.all([
        api.get('/foods?limit=100'),
        api.get('/categories'),
      ]);
      if (foodsRes?.data) setFoods(foodsRes.data);
      if (catsRes?.data) setCategories(catsRes.data);
    } catch (err) {
      console.error('Error fetching foods:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingFood(null);
    setFormData({
      name: '',
      description: '',
      category: categories[0]?._id || '',
      price: '',
      discountPrice: '0',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      foodType: 'veg',
      spiceLevel: 'medium',
      preparationTime: 20,
      isAvailable: true,
      isPopular: false,
      isFeatured: false,
      ingredients: '',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (food) => {
    setEditingFood(food);
    setFormData({
      name: food.name,
      description: food.description,
      category: food.category?._id || food.category,
      price: food.price,
      discountPrice: food.discountPrice || 0,
      image: food.image,
      foodType: food.foodType,
      spiceLevel: food.spiceLevel,
      preparationTime: food.preparationTime || 20,
      isAvailable: food.isAvailable,
      isPopular: food.isPopular,
      isFeatured: food.isFeatured,
      ingredients: Array.isArray(food.ingredients) ? food.ingredients.join(', ') : '',
    });
    setModalOpen(true);
  };

  const handleSaveFood = async (e) => {
    e.preventDefault();
    try {
      if (editingFood) {
        await api.put(`/foods/${editingFood._id}`, formData);
        showSuccess(`Updated dish '${formData.name}' successfully!`);
      } else {
        await api.post('/foods', formData);
        showSuccess(`Created dish '${formData.name}' successfully!`);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      showError(err.message || 'Failed to save food dish.');
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

  const filteredFoods = foods.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.category?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in text-stone-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Food Menu Dishes ({foods.length})
          </h1>
          <p className="text-xs sm:text-sm text-stone-400">
            Create, modify prices, assign categories, and toggle live availability
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Dish</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter dishes by name or category..."
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-brand-500"
        />
      </div>

      {/* Foods Table */}
      <div className="rounded-3xl bg-stone-950 border border-stone-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-stone-900 border-b border-stone-800 text-[11px] font-bold uppercase tracking-wider text-stone-400">
              <tr>
                <th className="py-3 px-4">Dish</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price / Disc.</th>
                <th className="py-3 px-4">Diet & Spice</th>
                <th className="py-3 px-4">Availability</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {filteredFoods.map((food) => (
                <tr key={food._id} className="hover:bg-stone-900/50 transition-colors">
                  {/* Dish */}
                  <td className="py-3 px-4 flex items-center gap-3">
                    <img
                      src={food.image}
                      alt={food.name}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-white text-sm">{food.name}</h4>
                      <span className="text-[10px] text-stone-400 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {food.rating?.toFixed(1)} ({food.numReviews || 0})
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
                          ? 'bg-emerald-900/60 text-emerald-300'
                          : 'bg-rose-900/60 text-rose-300'
                      }`}
                    >
                      {food.foodType}
                    </span>
                    <span className="text-[10px] text-amber-400 block capitalize">
                      {food.spiceLevel}
                    </span>
                  </td>

                  {/* Availability Toggle */}
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggleAvailability(food._id)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-colors ${
                        food.isAvailable
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {food.isAvailable ? 'In Stock' : 'Sold Out'}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right space-x-2">
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => handleOpenEditModal(food)}
                          className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-brand-400 transition-colors"
                          title="Edit Dish"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteFood(food._id, food.name)}
                          className="p-1.5 rounded-lg bg-stone-900 hover:bg-rose-900/40 text-stone-300 hover:text-rose-400 transition-colors"
                          title="Delete Dish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Food Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-3xl bg-stone-900 border border-stone-800 p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-xl font-serif font-bold text-white">
                {editingFood ? `Edit Dish: ${editingFood.name}` : 'Add New Culinary Dish'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFood} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-stone-300">Dish Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Paneer Tikka Angara"
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-300">Category</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-brand-500"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-300">Standard Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="350"
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-300">Discount Price (₹, optional)</label>
                  <input
                    type="number"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-300">Dietary Type</label>
                  <select
                    value={formData.foodType}
                    onChange={(e) => setFormData({ ...formData, foodType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="veg">Pure Veg</option>
                    <option value="vegan">Vegan</option>
                    <option value="non-veg">Non-Veg</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-300">Spice Level</label>
                  <select
                    value={formData.spiceLevel}
                    onChange={(e) => setFormData({ ...formData, spiceLevel: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="mild">Mild</option>
                    <option value="medium">Medium</option>
                    <option value="spicy">Spicy</option>
                    <option value="extra-spicy">Extra Spicy</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-300">Image URL</label>
                <input
                  type="url"
                  required
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-300">Description</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe authentic preparation, herbs and spices..."
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-brand-500 resize-none"
                ></textarea>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-300">Key Ingredients (Comma separated)</label>
                <input
                  type="text"
                  value={formData.ingredients}
                  onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                  placeholder="Paneer, Desi Ghee, Kashmiri Chili, Kasuri Methi"
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPopular}
                    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                    className="rounded bg-stone-950 border-stone-800 text-brand-600 focus:ring-0"
                  />
                  <span>Mark as Popular</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded bg-stone-950 border-stone-800 text-brand-600 focus:ring-0"
                  />
                  <span>Mark as Featured</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-md transition-colors"
                >
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFoods;
