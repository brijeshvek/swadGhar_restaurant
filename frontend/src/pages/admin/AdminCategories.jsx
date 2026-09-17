import React, { useEffect, useState } from 'react';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  X,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
  Upload,
  Camera,
} from 'lucide-react';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { AnimatedContent, SpotlightCard } from '../../components/animations';

const PRESET_IMAGES = [
  {
    name: 'Gujarati Thali & Specials',
    url: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Starters & Appetizers',
    url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Royal Biryani & Rice',
    url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Tandoori & Indian Breads',
    url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Mithai & Traditional Desserts',
    url: 'https://images.unsplash.com/photo-1589301773859-bb436d46d5c6?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Beverages & Masala Chai',
    url: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?auto=format&fit=crop&w=600&q=80',
  },
];

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { showSuccess, showError } = useNotification();

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    sortOrder: 0,
    isActive: true,
  });

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

  // Close modal on escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && modalOpen) {
        setModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalOpen]);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      image: PRESET_IMAGES[0].url,
      sortOrder: categories.length + 1,
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || '',
      description: cat.description || '',
      image: cat.image || PRESET_IMAGES[0].url,
      sortOrder: cat.sortOrder !== undefined ? cat.sortOrder : 0,
      isActive: cat.isActive !== undefined ? cat.isActive : true,
    });
    setModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showError('File size is too large. Please select an image under 10MB.');
      return;
    }

    setUploadingImage(true);
    const data = new FormData();
    data.append('image', file);

    try {
      const res = await api.post('/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res?.url) {
        setFormData((prev) => ({ ...prev, image: res.url }));
        showSuccess('Category banner uploaded successfully!');
      } else {
        throw new Error('No URL returned from upload server');
      }
    } catch (err) {
      console.warn('Backend upload failed, using local Base64 fallback:', err);
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({ ...prev, image: reader.result }));
        showSuccess('Image selected & preview updated!');
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showError('Please enter a category name.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, {
          name: formData.name.trim(),
          description: formData.description.trim(),
          image: formData.image.trim(),
          sortOrder: Number(formData.sortOrder) || 0,
          isActive: formData.isActive,
        });
        showSuccess(`Category '${formData.name}' updated!`);
      } else {
        await api.post('/categories', {
          name: formData.name.trim(),
          description: formData.description.trim(),
          image: formData.image.trim(),
          sortOrder: Number(formData.sortOrder) || categories.length + 1,
          isActive: formData.isActive,
        });
        showSuccess(`Category '${formData.name}' created!`);
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      showError(err.message || 'Failed to save category.');
    } finally {
      setSubmitting(false);
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
    <div className="space-y-6 text-stone-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white flex items-center gap-3">
            <span>Menu Categories</span>
            <span className="px-3 py-0.5 rounded-full bg-brand-500/20 text-brand-400 text-xs font-sans font-bold border border-brand-500/30">
              {categories.length} Total
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-400">
            Organize customer dishes into uniform culinary sections with custom images and sort orders
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg shadow-brand-500/20 hover:shadow-glow transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Categories Grid - Equal Sized Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-72 rounded-3xl bg-stone-900/60 border border-stone-800 animate-pulse"></div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="py-16 text-center bg-stone-950 rounded-3xl border border-stone-800 space-y-4">
          <FolderTree className="w-12 h-12 text-stone-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Categories Created Yet</h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            Click the "Add New Category" button above to create your first food category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-stretch">
          {categories.map((cat, idx) => (
            <AnimatedContent key={cat._id} delay={idx * 0.05} className="h-full">
              <SpotlightCard className="h-full flex flex-col justify-between rounded-3xl bg-stone-950 border border-stone-800/90 hover:border-brand-500/40 shadow-xl group transition-all">
                {/* Category Image - Fixed Aspect Ratio & Consistent Dimensions */}
                <div className="relative h-44 w-full overflow-hidden bg-stone-900 shrink-0">
                  <img
                    src={cat.image || PRESET_IMAGES[0].url}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = PRESET_IMAGES[0].url;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-black/30" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase backdrop-blur-md border ${
                        cat.isActive !== false
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-950/80 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {cat.isActive !== false ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 text-rose-400" />
                          <span>Hidden</span>
                        </>
                      )}
                    </span>

                    <span className="px-2.5 py-0.5 rounded-full bg-stone-900/90 text-amber-400 text-[10px] font-bold backdrop-blur-sm border border-stone-700">
                      Order #{cat.sortOrder || 0}
                    </span>
                  </div>
                </div>

                {/* Category Content Details - Flex Column with Equal Heights */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <h3 className="font-serif font-bold text-base text-white line-clamp-1 group-hover:text-amber-300 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed min-h-[32px]">
                      {cat.description || 'Authentic regional culinary dishes handcrafted with fresh ingredients.'}
                    </p>
                  </div>

                  {/* Actions Footer - Locked to Bottom */}
                  <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between mt-auto">
                    <span className="text-[11px] font-mono text-stone-500">
                      /{cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-')}
                    </span>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-amber-400 transition-colors border border-stone-800"
                        title="Edit Category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat._id, cat.name)}
                        className="p-2 rounded-xl bg-stone-900 hover:bg-rose-950/60 text-stone-300 hover:text-rose-400 transition-colors border border-stone-800 hover:border-rose-800/50"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </SpotlightCard>
            </AnimatedContent>
          ))}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div
          onClick={() => !submitting && setModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-lg w-full max-h-[90vh] overflow-y-auto rounded-3xl bg-stone-900 border border-stone-800 p-6 sm:p-8 space-y-6 shadow-2xl relative"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center border border-brand-500/30">
                  <FolderTree className="w-4 h-4" />
                </div>
                <h3 className="text-xl font-serif font-bold text-white">
                  {editingCategory ? `Edit: ${editingCategory.name}` : 'Create Menu Category'}
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

            {/* Modal Form */}
            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-stone-300 flex items-center gap-1">
                  <span>Category Name</span>
                  <span className="text-brand-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Gujarati Kathiyawadi Thali"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white placeholder:text-stone-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-xs"
                />
              </div>

              {/* Image Upload, URL & Presets */}
              <div className="space-y-3 p-3.5 rounded-2xl bg-stone-950/60 border border-stone-800/80">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-stone-200 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-amber-400" />
                    <span>Category Banner Image *</span>
                  </label>
                  <span className="text-[10px] text-amber-400/80 font-medium">Upload File or Paste Link</span>
                </div>

                {/* Upload Button + File Input + Image Preview */}
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <div className="w-20 h-16 rounded-xl bg-stone-900 border border-stone-800 overflow-hidden shrink-0 flex items-center justify-center relative shadow-inner">
                    {formData.image ? (
                      <img
                        src={formData.image}
                        alt="Category Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = PRESET_IMAGES[0].url;
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
                      <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 hover:to-amber-500 text-white font-bold text-xs shadow-md transition-all shrink-0 active:scale-95">
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

                {/* Preset Suggestions */}
                <div className="pt-1 border-t border-stone-900">
                  <span className="text-[10px] text-stone-400 font-semibold block mb-1">
                    ✨ Or Quick Select Preset:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {PRESET_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormData({ ...formData, image: preset.url })}
                        className={`p-1.5 rounded-lg border text-left text-[10px] truncate transition-colors flex items-center gap-1.5 ${
                          formData.image === preset.url
                            ? 'bg-brand-600/30 border-brand-500 text-amber-300'
                            : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                        }`}
                        title={preset.name}
                      >
                        <img src={preset.url} alt="" className="w-4 h-4 rounded object-cover" />
                        <span className="truncate">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-300">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the regional flavors, specials, and culinary heritage of this section..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white placeholder:text-stone-600 focus:outline-none focus:border-brand-500 resize-none text-xs leading-relaxed"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-stone-300">Display Order</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-brand-500 text-xs"
                  />
                </div>

                <div className="space-y-1.5 flex flex-col justify-end">
                  <label className="font-bold text-stone-300">Visibility</label>
                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-950 border border-stone-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded bg-stone-900 border-stone-700 text-brand-600 focus:ring-0 w-4 h-4"
                    />
                    <span className="text-stone-300 font-semibold text-xs">
                      {formData.isActive ? 'Active on Menu' : 'Hidden from Menu'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Form Buttons */}
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
                  <span>{editingCategory ? 'Update Category' : 'Create Category'}</span>
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
