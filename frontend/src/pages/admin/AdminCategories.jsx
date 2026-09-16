import React, { useEffect, useState } from 'react';
import { FolderTree, Plus, Edit2, Trash2, X } from 'lucide-react';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useNotification();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [sortOrder, setSortOrder] = useState(0);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories?includeInactive=true');
      if (res?.data) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setImage('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80');
    setSortOrder(categories.length + 1);
    setModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setImage(cat.image || '');
    setSortOrder(cat.sortOrder || 0);
    setModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, {
          name,
          description,
          image,
          sortOrder,
        });
        showSuccess(`Category '${name}' updated!`);
      } else {
        await api.post('/categories', {
          name,
          description,
          image,
          sortOrder,
        });
        showSuccess(`Category '${name}' created!`);
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      showError(err.message || 'Failed to save category.');
    }
  };

  const handleDeleteCategory = async (id, catName) => {
    if (!window.confirm(`Are you sure you want to delete '${catName}'?`)) return;
    try {
      await api.delete(`/categories/${id}`);
      showSuccess(`Category '${catName}' deleted.`);
      fetchCategories();
    } catch (err) {
      showError(err.message || 'Cannot delete category.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-stone-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Menu Categories ({categories.length})
          </h1>
          <p className="text-xs sm:text-sm text-stone-400">
            Organize customer dishes into intuitive culinary sections
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <div
            key={cat._id}
            className="rounded-3xl bg-stone-950 border border-stone-800 overflow-hidden shadow-lg flex flex-col justify-between"
          >
            <div className="relative aspect-[16/9] w-full bg-stone-900">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover opacity-80"
              />
              <span className="absolute top-3 right-3 px-2 py-0.5 rounded-lg bg-stone-900/90 text-amber-400 text-[10px] font-bold">
                Order #{cat.sortOrder || 0}
              </span>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-base text-white">{cat.name}</h3>
                <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                  {cat.description || 'Authentic regional dishes'}
                </p>
              </div>

              <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between">
                <span className="text-[11px] text-emerald-400 font-semibold">Active</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-brand-400 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat._id, cat.name)}
                    className="p-1.5 rounded-lg bg-stone-900 hover:bg-rose-900/40 text-stone-300 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in">
          <div className="max-w-md w-full rounded-3xl bg-stone-900 border border-stone-800 p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-xl font-serif font-bold text-white">
                {editingCategory ? `Edit: ${editingCategory.name}` : 'New Category'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-stone-300">Category Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Gujarati Specials"
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-300">Image URL</label>
                <input
                  type="url"
                  required
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-300">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief summary of dishes..."
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-brand-500 resize-none"
                ></textarea>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-300">Display Order</label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-brand-500"
                />
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
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
