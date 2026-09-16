import React, { useState } from 'react';
import { User, Phone, Mail, MapPin, Plus, Trash2, Lock, Save, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';

const Profile = () => {
  const { user, updateUserData } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileSaving, setProfileSaving] = useState(false);

  // Address Modal State
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newPincode, setNewPincode] = useState('');
  const [newLandmark, setNewLandmark] = useState('');
  const [addressSaving, setAddressSaving] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const res = await api.put('/auth/profile', { name, phone });
      updateUserData(res.data);
      showSuccess('Profile updated successfully!');
    } catch (err) {
      showError(err.message || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newStreet || !newCity || !newPincode) {
      showError('Please fill street, city and pincode.');
      return;
    }

    setAddressSaving(true);
    try {
      const res = await api.post('/auth/address', {
        street: newStreet,
        city: newCity,
        pincode: newPincode,
        landmark: newLandmark,
      });
      updateUserData({ ...user, addresses: res.data });
      showSuccess('Delivery address added!');
      setNewStreet('');
      setNewCity('');
      setNewPincode('');
      setNewLandmark('');
    } catch (err) {
      showError(err.message || 'Failed to add address.');
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const res = await api.delete(`/auth/address/${addressId}`);
      updateUserData({ ...user, addresses: res.data });
      showSuccess('Address removed.');
    } catch (err) {
      showError(err.message || 'Failed to delete address.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordSaving(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      showSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      showError(err.message || 'Failed to change password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fade-in">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-stone-900 to-stone-950 text-white border border-stone-800 shadow-xl">
        <img
          src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
          alt={user.name}
          className="w-20 h-20 rounded-full object-cover border-2 border-brand-500 shadow-glow"
        />
        <div className="text-center sm:text-left space-y-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              {user.name}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-400 text-xs font-bold uppercase">
              {user.role}
            </span>
          </div>
          <p className="text-stone-400 text-sm">{user.email}</p>
          <p className="text-stone-500 text-xs">
            Member since {new Date(user.createdAt || Date.now()).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Details Edit */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-6">
          <h3 className="text-xl font-serif font-bold text-stone-900 flex items-center gap-2">
            <User className="w-5 h-5 text-brand-600" />
            <span>Personal Information</span>
          </h3>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Email (Read-only)</label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-100 border border-stone-200 text-sm text-stone-500 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={profileSaving}
              className="py-2.5 px-6 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-sm transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{profileSaving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-6">
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
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={passwordSaving}
              className="py-2.5 px-6 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm shadow-sm transition-colors"
            >
              {passwordSaving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>

      {/* Saved Delivery Addresses */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-6">
        <h3 className="text-xl font-serif font-bold text-stone-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-brand-600" />
          <span>Saved Delivery Addresses</span>
        </h3>

        {/* Existing Addresses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {user.addresses && user.addresses.length > 0 ? (
            user.addresses.map((addr) => (
              <div
                key={addr._id}
                className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1 text-xs">
                  <p className="font-bold text-stone-900">{addr.street}</p>
                  <p className="text-stone-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                  {addr.landmark && <p className="text-stone-400">Near: {addr.landmark}</p>}
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteAddress(addr._id)}
                  className="self-end inline-flex items-center gap-1 text-rose-500 hover:text-rose-700 text-xs font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            ))
          ) : (
            <div className="sm:col-span-3 text-center py-6 text-stone-500 text-xs">
              No saved addresses yet. Add one below for faster one-click checkout!
            </div>
          )}
        </div>

        {/* Add New Address Form */}
        <form onSubmit={handleAddAddress} className="pt-4 border-t border-stone-200 space-y-4">
          <h4 className="text-sm font-bold text-stone-800">Add New Address</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              required
              placeholder="Street / Flat / Colony"
              value={newStreet}
              onChange={(e) => setNewStreet(e.target.value)}
              className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-brand-500"
            />
            <input
              type="text"
              required
              placeholder="City (e.g. Ahmedabad)"
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
              className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-brand-500"
            />
            <input
              type="text"
              required
              placeholder="Pincode (e.g. 380015)"
              value={newPincode}
              onChange={(e) => setNewPincode(e.target.value)}
              className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={addressSaving}
            className="py-2 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Save New Address</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
