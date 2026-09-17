import React, { useState, useEffect } from 'react';
import {
  Store,
  Users,
  MapPin,
  Phone,
  Mail,
  KeyRound,
  Plus,
  Trash2,
  Edit2,
  ShieldCheck,
  ChefHat,
  Clock,
  Award,
  Sparkles,
  Search,
  CheckCircle,
  X
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const AdminFranchises = () => {
  const { user, isAdmin } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [franchises, setFranchises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Manager Credentials Modal State (Admin Only)
  const [managerModalOpen, setManagerModalOpen] = useState(false);
  const [editingFranchise, setEditingFranchise] = useState(null);
  const [managerForm, setManagerForm] = useState({
    managerName: '',
    managerEmail: '',
    managerPassword: '',
    managerPhone: '',
  });

  // Add Staff Modal State
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [staffForm, setStaffForm] = useState({
    name: '',
    designation: '',
    phone: '',
    email: '',
    shift: 'Full Day',
    specialty: '',
    experience: '5+ Years',
  });

  const fetchFranchises = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const res = await api.get('/franchises');
        if (res.data) {
          setFranchises(res.data);
          if (res.data.length > 0 && !selectedBranchId) {
            setSelectedBranchId(res.data[0]._id || '0');
          }
        }
      } else {
        // Logged in as Branch Manager -> fetch only their branch
        const res = await api.get('/franchises/my-branch');
        if (res.data) {
          setFranchises([res.data]);
          setSelectedBranchId(res.data._id || '0');
        }
      }
    } catch (err) {
      showError(err.message || 'Failed to load franchise details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFranchises();
  }, [isAdmin]);

  // Open Manager Credentials Edit Modal
  const openManagerModal = (branch) => {
    setEditingFranchise(branch);
    setManagerForm({
      managerName: branch.managerName || '',
      managerEmail: branch.managerEmail || '',
      managerPassword: '',
      managerPhone: branch.managerPhone || branch.phone || '',
    });
    setManagerModalOpen(true);
  };

  // Submit Manager Credentials Update
  const handleManagerSubmit = async (e) => {
    e.preventDefault();
    if (!editingFranchise) return;
    try {
      const res = await api.put(
        `/franchises/${editingFranchise._id}/manager-credentials`,
        managerForm
      );
      showSuccess(res.message || 'Branch Manager credentials updated successfully!');
      setManagerModalOpen(false);
      fetchFranchises();
    } catch (err) {
      showError(err.message || 'Failed to update manager credentials.');
    }
  };

  // Open Add Staff Modal
  const openStaffModal = (branch) => {
    setEditingFranchise(branch);
    setStaffForm({
      name: '',
      designation: '',
      phone: '',
      email: '',
      shift: 'Full Day',
      specialty: 'Hospitality & Culinary Excellence',
      experience: '5+ Years',
    });
    setStaffModalOpen(true);
  };

  // Submit Add Staff
  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    if (!editingFranchise) return;
    try {
      const res = await api.post(
        `/franchises/${editingFranchise._id}/staff`,
        staffForm
      );
      showSuccess(res.message || 'Staff member added to branch team!');
      setStaffModalOpen(false);
      fetchFranchises();
    } catch (err) {
      showError(err.message || 'Failed to add staff member.');
    }
  };

  // Remove Staff Member
  const handleRemoveStaff = async (branchId, staffId, staffName) => {
    if (!window.confirm(`Are you sure you want to remove ${staffName} from this branch?`)) return;
    try {
      const res = await api.delete(`/franchises/${branchId}/staff/${staffId}`);
      showSuccess(res.message || 'Staff member removed.');
      fetchFranchises();
    } catch (err) {
      showError(err.message || 'Failed to remove staff member.');
    }
  };

  const selectedBranch =
    franchises.find((f) => f._id === selectedBranchId || String(f._id) === String(selectedBranchId)) ||
    franchises[0];

  const filteredFranchises = franchises.filter(
    (f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.managerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Store className="w-6 h-6 text-amber-500" />
            <h1 className="text-2xl font-serif font-bold text-white">
              {isAdmin ? '5 Restaurant Franchises & Staff' : `${selectedBranch?.city || 'Branch'} Staff & Operations`}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            {isAdmin
              ? 'Manage branch managers, login credentials, and view complete staff team rosters across all 5 locations'
              : `Logged in as Branch Manager (${user?.name}). Manage your branch team and staff details.`}
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Superadmin Access</span>
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-stone-400">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Branch Selector (Visible to Superadmin) */}
          {isAdmin && (
            <div className="lg:col-span-4 space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search franchise or city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-2">
                {filteredFranchises.map((b) => {
                  const isSelected = (b._id || '0') === (selectedBranch?._id || '0');
                  return (
                    <button
                      key={b._id}
                      type="button"
                      onClick={() => setSelectedBranchId(b._id)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all ${
                        isSelected
                          ? 'bg-amber-600/10 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                          : 'bg-stone-950/80 border-stone-800 hover:border-stone-700 hover:bg-stone-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-white">{b.city} Branch</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-800 text-amber-400">
                          {b.staffTeam?.length || 0} Staff
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 truncate mt-1">{b.name}</p>
                      <div className="mt-2.5 pt-2.5 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400">
                        <span>👤 Manager: <strong className="text-stone-200">{b.managerName}</strong></span>
                        <span className="text-amber-500/80 font-mono text-[10px]">ID: Active</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Right Column: Branch Details, Manager Credentials & Staff Team */}
          <div className={isAdmin ? 'lg:col-span-8 space-y-6' : 'lg:col-span-12 space-y-6'}>
            {selectedBranch ? (
              <>
                {/* Branch Banner Card */}
                <div className="p-6 rounded-3xl bg-stone-950 border border-stone-800 shadow-xl relative overflow-hidden space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                          {selectedBranch.branchType}
                        </span>
                        <span className="text-xs text-stone-400">Seating: {selectedBranch.seatingCapacity} Seats</span>
                      </div>
                      <h2 className="text-xl font-bold text-white mt-1.5">{selectedBranch.name}</h2>
                      <p className="text-xs text-stone-400 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-500" />
                        <span>{selectedBranch.address}</span>
                      </p>
                    </div>

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => openManagerModal(selectedBranch)}
                        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all self-start sm:self-auto cursor-pointer"
                      >
                        <KeyRound className="w-4 h-4" />
                        <span>Edit Manager ID & Password</span>
                      </button>
                    )}
                  </div>

                  {/* Manager Login Info Box */}
                  <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase font-bold block">General Manager</span>
                      <span className="font-bold text-white text-sm">{selectedBranch.managerName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase font-bold block">Manager Login ID (Email)</span>
                      <span className="font-mono text-amber-400 text-xs font-semibold">{selectedBranch.managerEmail}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase font-bold block">Manager Phone</span>
                      <span className="font-mono text-stone-300 text-xs">{selectedBranch.managerPhone || selectedBranch.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Staff Team Roster Card */}
                <div className="p-6 rounded-3xl bg-stone-950 border border-stone-800 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Users className="w-4 h-4 text-amber-500" />
                        <span>Branch Staff Team Roster ({selectedBranch.staffTeam?.length || 0} Members)</span>
                      </h3>
                      <p className="text-xs text-stone-400 mt-0.5">
                        Operational staff details (Chefs, Masters, Captains, Cashiers, Stewards)
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => openStaffModal(selectedBranch)}
                      className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber-400" />
                      <span>Add Staff</span>
                    </button>
                  </div>

                  {/* Staff Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedBranch.staffTeam?.map((s, idx) => (
                      <div
                        key={s._id || idx}
                        className="p-4 rounded-2xl bg-stone-900 border border-stone-800 hover:border-amber-500/40 transition-all flex items-start justify-between gap-3"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <img
                            src={s.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                            alt={s.name}
                            className="w-10 h-10 rounded-full object-cover border border-amber-500/30 shrink-0 mt-0.5"
                          />
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs text-white truncate">{s.name}</h4>
                            <p className="text-[11px] text-amber-400 font-semibold truncate mt-0.5">{s.designation}</p>
                            <p className="text-[10px] text-stone-400 mt-1 flex items-center gap-1.5 truncate">
                              <Phone className="w-3 h-3 text-stone-400 shrink-0" />
                              <span>{s.phone}</span>
                              <span className="text-stone-600">•</span>
                              <Clock className="w-3 h-3 text-stone-400 shrink-0" />
                              <span>{s.shift}</span>
                            </p>
                            {s.specialty && (
                              <p className="text-[10px] text-stone-400 mt-0.5 truncate flex items-center gap-1">
                                <Award className="w-3 h-3 text-amber-500 shrink-0" />
                                <span>{s.specialty}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveStaff(selectedBranch._id, s._id || s.email, s.name)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                          title="Remove Staff"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-stone-400 bg-stone-950 rounded-3xl border border-stone-800">
                No branch selected or found.
              </div>
            )}
          </div>

        </div>
      )}

      {/* MODAL 1: EDIT MANAGER CREDENTIALS (ADMIN ONLY) */}
      {managerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-stone-900 rounded-3xl border border-stone-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base">Edit Manager Credentials</h3>
                <p className="text-xs text-stone-400">{editingFranchise?.city} Branch</p>
              </div>
              <button
                type="button"
                onClick={() => setManagerModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManagerSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-300">Branch Manager Name</label>
                <input
                  type="text"
                  required
                  value={managerForm.managerName}
                  onChange={(e) => setManagerForm({ ...managerForm, managerName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-300">Manager Login ID (Email)</label>
                <input
                  type="email"
                  required
                  value={managerForm.managerEmail}
                  onChange={(e) => setManagerForm({ ...managerForm, managerEmail: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-300">New Password (Leave blank to keep unchanged)</label>
                <input
                  type="password"
                  placeholder="Enter new password (e.g. AHMStaff@123)"
                  value={managerForm.managerPassword}
                  onChange={(e) => setManagerForm({ ...managerForm, managerPassword: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-300">Manager Contact Phone</label>
                <input
                  type="text"
                  value={managerForm.managerPhone}
                  onChange={(e) => setManagerForm({ ...managerForm, managerPhone: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setManagerModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold text-stone-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white shadow-md cursor-pointer"
                >
                  Save & Update Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD STAFF TO BRANCH */}
      {staffModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-stone-900 rounded-3xl border border-stone-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base">Add Staff Member</h3>
                <p className="text-xs text-stone-400">{editingFranchise?.city} Branch Team</p>
              </div>
              <button
                type="button"
                onClick={() => setStaffModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStaffSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-300">Staff Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Maharaj"
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-300">Designation / Role</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Executive Head Chef / Farsan Master / Floor Captain"
                  value={staffForm.designation}
                  onChange={(e) => setStaffForm({ ...staffForm, designation: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-300">Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98251 00000"
                    value={staffForm.phone}
                    onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-300">Shift</label>
                  <select
                    value={staffForm.shift}
                    onChange={(e) => setStaffForm({ ...staffForm, shift: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Full Day">Full Day</option>
                    <option value="Morning Shift">Morning Shift</option>
                    <option value="Morning & Lunch">Morning & Lunch</option>
                    <option value="Evening Shift">Evening Shift</option>
                    <option value="Night Shift">Night Shift</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-300">Specialty / Experience</label>
                <input
                  type="text"
                  placeholder="e.g. Kathiyawadi & Surti Farsan Expert (8+ Years)"
                  value={staffForm.specialty}
                  onChange={(e) => setStaffForm({ ...staffForm, specialty: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setStaffModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold text-stone-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white shadow-md cursor-pointer"
                >
                  Add to Branch Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFranchises;
