import React, { useEffect, useState } from 'react';
import { Users, Search, ShieldAlert, ShieldCheck, Mail, Phone } from 'lucide-react';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { showSuccess, showError } = useNotification();

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/admin/customers');
      if (res?.data) {
        setCustomers(res.data);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleBlock = async (id) => {
    try {
      const res = await api.patch(`/admin/customers/${id}/toggle-block`);
      showSuccess(res.message);
      fetchCustomers();
    } catch (err) {
      showError(err.message || 'Failed to update customer status.');
    }
  };

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in text-stone-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Registered Customers ({customers.length})
          </h1>
          <p className="text-xs sm:text-sm text-stone-400">
            View customer order volumes, total spending, and manage access privileges
          </p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by customer name or email..."
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-brand-500"
        />
      </div>

      <div className="rounded-3xl bg-stone-950 border border-stone-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-stone-900 border-b border-stone-800 text-[11px] font-bold uppercase tracking-wider text-stone-400">
              <tr>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Total Orders</th>
                <th className="py-3.5 px-4">Lifetime Spend</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {filtered.map((c) => (
                <tr key={c._id} className="hover:bg-stone-900/50 transition-colors">
                  <td className="py-3.5 px-4 flex items-center gap-3">
                    <img
                      src={c.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                      alt={c.name}
                      className="w-9 h-9 rounded-full object-cover border border-stone-700"
                    />
                    <div>
                      <span className="font-bold text-white block text-sm">{c.name}</span>
                      <span className="text-[10px] text-stone-500">
                        Joined {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 space-y-0.5">
                    <div className="flex items-center gap-1.5 text-stone-300">
                      <Mail className="w-3.5 h-3.5 text-stone-500" />
                      <span>{c.email}</span>
                    </div>
                    {c.phone && (
                      <div className="flex items-center gap-1.5 text-stone-400">
                        <Phone className="w-3.5 h-3.5 text-brand-500" />
                        <span>{c.phone}</span>
                      </div>
                    )}
                  </td>

                  <td className="py-3.5 px-4 font-bold text-white">
                    {c.ordersCount} Orders
                  </td>

                  <td className="py-3.5 px-4 font-bold text-amber-400 text-sm font-sans">
                    ₹{c.totalSpent}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                        c.isBlocked
                          ? 'bg-rose-900/60 text-rose-300 border border-rose-700/50'
                          : 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'
                      }`}
                    >
                      {c.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleToggleBlock(c._id)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-colors ${
                        c.isBlocked
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-stone-800 hover:bg-rose-900/40 text-rose-300'
                      }`}
                    >
                      {c.isBlocked ? 'Unblock Customer' : 'Suspend Account'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomers;
