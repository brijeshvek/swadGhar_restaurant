import React, { useState, useRef } from 'react';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Plus,
  Trash2,
  Lock,
  Save,
  CheckCircle2,
  Camera,
  Edit2,
  Home,
  Briefcase,
  Star,
  Loader2,
  X,
  UploadCloud,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import { AnimatedContent, SpotlightCard } from '../components/animations';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80',
];

const Profile = () => {
  const { user, updateUserData } = useAuth();
  const { showSuccess, showError } = useNotification();
  const fileInputRef = useRef(null);

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileSaving, setProfileSaving] = useState(false);

  // Avatar Upload State
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || PRESET_AVATARS[0]);

  // Address Modal State (Add or Edit)
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    label: 'Home',
    fullName: user?.name || '',
    phone: user?.phone || '',
    houseNo: '',
    street: '',
    area: '',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '',
    landmark: '',
    deliveryInstructions: '',
    isDefault: false,
  });
  const [addressSaving, setAddressSaving] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Handle Avatar Selection from Local File
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showError('Image size should be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target.result;
      setAvatarPreview(base64Data);
      await saveAvatar(base64Data);
    };
    reader.readAsDataURL(file);
  };

  const saveAvatar = async (avatarUrl) => {
    setAvatarLoading(true);
    try {
      const res = await api.put('/auth/avatar', { avatar: avatarUrl });
      updateUserData(res.data);
      showSuccess('Profile picture updated successfully!');
    } catch (err) {
      showError(err.message || 'Failed to update profile picture.');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const res = await api.put('/auth/profile', { name, phone });
      updateUserData(res.data);
      showSuccess('Profile details updated!');
    } catch (err) {
      showError(err.message || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  // Open Address Modal for Create or Edit
  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddressForm({
      label: 'Home',
      fullName: user?.name || '',
      phone: user?.phone || '',
      houseNo: '',
      street: '',
      area: '',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '',
      landmark: '',
      deliveryInstructions: '',
      isDefault: (user?.addresses || []).length === 0,
    });
    setAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr) => {
    setEditingAddressId(addr._id);
    setAddressForm({
      label: addr.label || 'Home',
      fullName: addr.fullName || user?.name || '',
      phone: addr.phone || user?.phone || '',
      houseNo: addr.houseNo || '',
      street: addr.street || addr.address || '',
      area: addr.area || '',
      city: addr.city || 'Ahmedabad',
      state: addr.state || 'Gujarat',
      pincode: addr.pincode || '',
      landmark: addr.landmark || '',
      deliveryInstructions: addr.deliveryInstructions || '',
      isDefault: !!addr.isDefault,
    });
    setAddressModalOpen(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addressForm.street || !addressForm.city || !addressForm.pincode) {
      showError('Please fill in street, city, and postal code.');
      return;
    }

    setAddressSaving(true);
    try {
      let res;
      if (editingAddressId) {
        res = await api.put(`/auth/addresses/${editingAddressId}`, addressForm);
        showSuccess('Address updated successfully!');
      } else {
        res = await api.post('/auth/addresses', addressForm);
        showSuccess('New delivery address added!');
      }
      updateUserData({ ...user, addresses: res.data });
      setAddressModalOpen(false);
    } catch (err) {
      showError(err.message || 'Failed to save address.');
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to remove this address?')) return;
    try {
      const res = await api.delete(`/auth/addresses/${addressId}`);
      updateUserData({ ...user, addresses: res.data });
      showSuccess('Address removed.');
    } catch (err) {
      showError(err.message || 'Failed to delete address.');
    }
  };

  const handleSetDefaultAddress = async (addr) => {
    try {
      const res = await api.put(`/auth/addresses/${addr._id}`, {
        ...addr,
        isDefault: true,
      });
      updateUserData({ ...user, addresses: res.data });
      showSuccess(`'${addr.label || 'Address'}' set as default delivery location.`);
    } catch (err) {
      showError(err.message || 'Failed to set default address.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showError('New passwords do not match.');
      return;
    }

    setPasswordSaving(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      showSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showError(err.message || 'Failed to change password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Info & Avatar Uploader */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 text-white border border-stone-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          {/* Avatar with Upload Badge */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-amber-500 shadow-glow bg-stone-800 relative">
              <img
                src={avatarPreview || user.avatar || PRESET_AVATARS[0]}
                alt={user.name}
                className="w-full h-full object-cover"
              />
              {avatarLoading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                </div>
              )}
            </div>

            {/* Hidden Input & Camera Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarLoading}
              className="absolute bottom-0 right-0 p-2 rounded-full bg-brand-600 hover:bg-brand-500 text-white shadow-lg border border-white/20 transition-transform active:scale-95"
              title="Upload profile picture"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                {user.name}
              </h1>
              <span className="px-3 py-0.5 rounded-full bg-brand-500/20 text-amber-300 border border-brand-500/30 text-xs font-bold uppercase">
                {user.role}
              </span>
            </div>
            <p className="text-stone-400 text-sm">{user.email}</p>
            <p className="text-stone-500 text-xs">
              Registered SwadGhar Gourmet Diner • Member since{' '}
              {new Date(user.createdAt || Date.now()).toLocaleDateString('en-IN', {
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Quick Avatar Presets */}
        <div className="space-y-1.5 text-center md:text-right">
          <span className="text-[11px] text-stone-400 font-semibold block">
            ✨ Or Pick Quick Avatar:
          </span>
          <div className="flex items-center justify-center md:justify-end gap-1.5">
            {PRESET_AVATARS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setAvatarPreview(preset);
                  saveAvatar(preset);
                }}
                className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 ${
                  avatarPreview === preset ? 'border-amber-400 scale-105' : 'border-stone-700 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={preset} alt="preset" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Details Edit */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/80 shadow-sm space-y-6">
          <h3 className="text-xl font-serif font-bold text-stone-900 flex items-center gap-2">
            <User className="w-5 h-5 text-brand-600" />
            <span>Personal Information</span>
          </h3>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-900 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Email Address (Read-only)</label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-100 border border-stone-200 text-sm text-stone-500 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Mobile Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-900 focus:outline-none focus:border-brand-500"
              />
              <span className="text-[11px] text-stone-400 block">Used for order tracking and SMS dispatch notifications.</span>
            </div>

            <button
              type="submit"
              disabled={profileSaving}
              className="py-2.5 px-6 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-sm transition-colors flex items-center gap-2"
            >
              {profileSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{profileSaving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/80 shadow-sm space-y-6">
          <h3 className="text-xl font-serif font-bold text-stone-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-brand-600" />
            <span>Security & Password</span>
          </h3>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Confirm New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={passwordSaving}
              className="py-2.5 px-6 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm shadow-sm transition-colors flex items-center gap-2"
            >
              {passwordSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{passwordSaving ? 'Updating...' : 'Update Password'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Saved Delivery Addresses Book */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <h3 className="text-xl font-serif font-bold text-stone-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-600" />
              <span>Saved Delivery Addresses</span>
            </h3>
            <p className="text-xs text-stone-500">
              Manage locations for quick 1-click selection during checkout
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddAddress}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Address</span>
          </button>
        </div>

        {/* Existing Addresses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {user.addresses && user.addresses.length > 0 ? (
            user.addresses.map((addr) => (
              <div
                key={addr._id}
                className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 transition-all ${
                  addr.isDefault
                    ? 'bg-amber-50/60 border-amber-300 shadow-sm'
                    : 'bg-stone-50 border-stone-200/80'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase bg-white border border-stone-200 text-stone-800 shadow-xs">
                      {addr.label === 'Work' ? (
                        <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                      ) : (
                        <Home className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                      <span>{addr.label || 'Home'}</span>
                    </span>

                    {addr.isDefault && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-bold">
                        Default
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-stone-700 space-y-0.5">
                    {addr.fullName && <p className="font-bold text-stone-900">{addr.fullName}</p>}
                    {addr.phone && <p className="text-stone-500">{addr.phone}</p>}
                    <p className="font-medium">
                      {[addr.houseNo, addr.street, addr.area].filter(Boolean).join(', ') || addr.address}
                    </p>
                    <p className="text-stone-600">
                      {addr.city}, {addr.state} - <span className="font-mono font-semibold">{addr.pincode}</span>
                    </p>
                    {addr.landmark && (
                      <p className="text-[11px] text-stone-500 italic">Near: {addr.landmark}</p>
                    )}
                    {addr.deliveryInstructions && (
                      <p className="text-[11px] text-amber-800 bg-amber-100/60 px-2 py-0.5 rounded mt-1">
                        Note: {addr.deliveryInstructions}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-200/80 flex items-center justify-between text-xs font-semibold">
                  {!addr.isDefault ? (
                    <button
                      type="button"
                      onClick={() => handleSetDefaultAddress(addr)}
                      className="text-amber-700 hover:text-amber-900 hover:underline"
                    >
                      Set Default
                    </button>
                  ) : (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Primary</span>
                    </span>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditAddress(addr)}
                      className="p-1.5 rounded-lg bg-white border border-stone-200 text-stone-600 hover:text-brand-600 transition-colors"
                      title="Edit address"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(addr._id)}
                      className="p-1.5 rounded-lg bg-white border border-stone-200 text-stone-600 hover:text-rose-600 transition-colors"
                      title="Delete address"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="sm:col-span-3 text-center py-8 text-stone-500 text-xs bg-stone-50 rounded-2xl border border-dashed border-stone-300">
              No saved addresses yet. Click "Add New Address" above for instant 1-click checkout!
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Address Modal */}
      {addressModalOpen && (
        <div
          onClick={() => !addressSaving && setAddressModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-lg w-full max-h-[90vh] overflow-y-auto rounded-3xl bg-white border border-stone-200 p-6 sm:p-8 space-y-6 shadow-2xl relative"
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-600" />
                <span>{editingAddressId ? 'Edit Delivery Address' : 'Add New Delivery Address'}</span>
              </h3>
              <button
                onClick={() => setAddressModalOpen(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4 text-xs">
              {/* Address Label */}
              <div className="space-y-1.5">
                <label className="font-bold text-stone-700">Address Label</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Home', 'Work', 'Other'].map((lbl) => (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => setAddressForm({ ...addressForm, label: lbl })}
                      className={`py-2 px-3 rounded-xl font-bold border transition-colors ${
                        addressForm.label === lbl
                          ? 'bg-brand-50 border-brand-500 text-brand-700'
                          : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700">Recipient Name</label>
                  <input
                    type="text"
                    required
                    value={addressForm.fullName}
                    onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700">Flat / House No.</label>
                  <input
                    type="text"
                    value={addressForm.houseNo}
                    onChange={(e) => setAddressForm({ ...addressForm, houseNo: e.target.value })}
                    placeholder="e.g. B-402"
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs"
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="font-bold text-stone-700">Street / Society *</label>
                  <input
                    type="text"
                    required
                    value={addressForm.street}
                    onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                    placeholder="e.g. Royal Heights, SG Highway"
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700">City *</label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700">State</label>
                  <input
                    type="text"
                    required
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700">Postal Pincode *</label>
                  <input
                    type="text"
                    required
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                    placeholder="380015"
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-700">Landmark (Optional)</label>
                <input
                  type="text"
                  value={addressForm.landmark}
                  onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                  placeholder="Near ISKCON Temple"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-700">Delivery Instructions (Optional)</label>
                <input
                  type="text"
                  value={addressForm.deliveryInstructions}
                  onChange={(e) => setAddressForm({ ...addressForm, deliveryInstructions: e.target.value })}
                  placeholder="Leave package with guard, ring doorbell"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="rounded bg-stone-100 border-stone-300 text-brand-600 focus:ring-0 w-4 h-4"
                />
                <span className="font-bold text-stone-700">Set as primary default address</span>
              </label>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setAddressModalOpen(false)}
                  disabled={addressSaving}
                  className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addressSaving}
                  className="px-6 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-md flex items-center gap-1.5"
                >
                  {addressSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingAddressId ? 'Update Address' : 'Save Address'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
