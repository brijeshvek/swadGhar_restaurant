import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Phone,
  Mail,
  Calendar,
  Trash2,
  ExternalLink,
  Filter,
  CheckCircle2,
  RefreshCw,
  Eye,
  X,
  MessageCircle,
  Edit3
} from 'lucide-react';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'new', 'in_progress', 'resolved'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [statusModalInquiry, setStatusModalInquiry] = useState(null);
  const [newStatus, setNewStatus] = useState('in_progress');
  const [staffNote, setStaffNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inquiries');
      setInquiries(res.data || []);
    } catch (err) {
      console.error('Failed to load inquiries:', err);
      showError(err.response?.data?.message || 'Failed to load restaurant inquiries.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!statusModalInquiry) return;
    setUpdating(true);

    try {
      const res = await api.put(`/inquiries/${statusModalInquiry._id}/status`, {
        status: newStatus,
        notes: staffNote
      });

      setInquiries(prev =>
        prev.map(inq => inq._id === statusModalInquiry._id ? res.data : inq)
      );

      if (selectedInquiry?._id === statusModalInquiry._id) {
        setSelectedInquiry(res.data);
      }

      showSuccess(`Inquiry status updated to ${newStatus.replace('_', ' ')}.`);
      setStatusModalInquiry(null);
      setStaffNote('');
    } catch (err) {
      console.error('Failed to update status:', err);
      showError(err.response?.data?.message || 'Could not update inquiry status.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this customer inquiry?')) {
      return;
    }

    try {
      await api.delete(`/inquiries/${id}`);
      setInquiries(prev => prev.filter(inq => inq._id !== id));
      if (selectedInquiry?._id === id) {
        setSelectedInquiry(null);
      }
      showSuccess('Inquiry deleted successfully.');
    } catch (err) {
      console.error('Failed to delete inquiry:', err);
      showError(err.response?.data?.message || 'Could not delete inquiry.');
    }
  };

  // Filter inquiries
  const filteredInquiries = inquiries.filter(inq => {
    const matchesTab =
      activeTab === 'all' ||
      inq.status === activeTab;

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      inq.name?.toLowerCase().includes(query) ||
      inq.email?.toLowerCase().includes(query) ||
      inq.phone?.toLowerCase().includes(query) ||
      inq.subject?.toLowerCase().includes(query) ||
      inq.message?.toLowerCase().includes(query);

    return matchesTab && matchesSearch;
  });

  const totalCount = inquiries.length;
  const newCount = inquiries.filter(i => i.status === 'new').length;
  const inProgressCount = inquiries.filter(i => i.status === 'in_progress').length;
  const resolvedCount = inquiries.filter(i => i.status === 'resolved').length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-500/20 text-sky-400 border border-sky-500/30">
            New Lead
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
            In Progress
          </span>
        );
      case 'resolved':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Resolved
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-700 text-stone-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-amber-500" />
            <span>Customer Inquiries & Leads</span>
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Manage inquiries, banquet requests, catering, and customer messages submitted for your restaurant.
          </p>
        </div>
        <button
          onClick={fetchInquiries}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold border border-stone-700 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800/80">
          <p className="text-xs text-stone-400 font-medium">Total Inquiries</p>
          <p className="text-2xl font-bold font-sans text-white mt-1">{totalCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-stone-950 border border-sky-500/20 bg-sky-950/10">
          <p className="text-xs text-sky-400 font-medium">New Unread</p>
          <p className="text-2xl font-bold font-sans text-sky-300 mt-1">{newCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-stone-950 border border-amber-500/20 bg-amber-950/10">
          <p className="text-xs text-amber-400 font-medium">In Progress</p>
          <p className="text-2xl font-bold font-sans text-amber-300 mt-1">{inProgressCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-stone-950 border border-emerald-500/20 bg-emerald-950/10">
          <p className="text-xs text-emerald-400 font-medium">Resolved</p>
          <p className="text-2xl font-bold font-sans text-emerald-300 mt-1">{resolvedCount}</p>
        </div>
      </div>

      {/* Search and Tabs */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex gap-1.5 p-1 bg-stone-950 rounded-xl border border-stone-800 self-start">
          {[
            { id: 'all', label: `All (${totalCount})` },
            { id: 'new', label: `New (${newCount})` },
            { id: 'in_progress', label: `In Progress (${inProgressCount})` },
            { id: 'resolved', label: `Resolved (${resolvedCount})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer, subject, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 text-xs focus:outline-none focus:border-amber-500 placeholder:text-stone-600"
          />
        </div>
      </div>

      {/* Inquiries List */}
      <div className="rounded-2xl bg-stone-950 border border-stone-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-stone-500 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
            <span>Loading inquiries...</span>
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className="p-12 text-center text-stone-500 space-y-2">
            <MessageSquare className="w-8 h-8 mx-auto text-stone-600" />
            <p className="text-sm font-semibold text-stone-300">No Inquiries Found</p>
            <p className="text-xs text-stone-500">
              {searchQuery ? 'No inquiries matching your search criteria.' : 'No customer inquiries in this category.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-900/80 text-stone-400 font-bold border-b border-stone-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Subject & Type</th>
                  <th className="py-3.5 px-4">Message Snippet</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Received On</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60 text-stone-300">
                {filteredInquiries.map((inq) => {
                  const dateStr = new Date(inq.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  });
                  const timeStr = new Date(inq.createdAt).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <tr key={inq._id} className="hover:bg-stone-900/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-xs">{inq.name}</div>
                        <div className="text-[11px] text-stone-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-stone-500" />
                          <span>{inq.phone}</span>
                        </div>
                        {inq.email && (
                          <div className="text-[10px] text-stone-500 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" />
                            <span>{inq.email}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-stone-200 line-clamp-1">{inq.subject}</div>
                        {inq.eventType && (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-stone-800 text-stone-400 border border-stone-700">
                            {inq.eventType}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-stone-400 line-clamp-2 leading-relaxed text-[11px]">
                          {inq.message}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(inq.status)}
                      </td>
                      <td className="py-3.5 px-4 text-stone-400 text-[11px]">
                        <div>{dateStr}</div>
                        <div className="text-[10px] text-stone-500">{timeStr}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedInquiry(inq)}
                            title="View Full Inquiry"
                            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setStatusModalInquiry(inq);
                              setNewStatus(inq.status);
                              setStaffNote(inq.notes || '');
                            }}
                            title="Update Status & Note"
                            className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(inq._id)}
                            title="Delete Inquiry"
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Detail Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 text-stone-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-500" />
                <h3 className="font-serif font-bold text-lg text-white">Inquiry Details</h3>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] text-stone-500 uppercase font-bold">Customer Contact</p>
                  <p className="font-bold text-white text-sm mt-0.5">{selectedInquiry.name}</p>
                  <p className="text-stone-400 mt-0.5">{selectedInquiry.phone}</p>
                  {selectedInquiry.email && <p className="text-stone-400">{selectedInquiry.email}</p>}
                </div>
                <div>
                  {getStatusBadge(selectedInquiry.status)}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-1.5">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] text-amber-400 font-bold uppercase">Subject: {selectedInquiry.subject}</p>
                  {selectedInquiry.eventType && (
                    <span className="text-[10px] text-stone-400 capitalize">{selectedInquiry.eventType}</span>
                  )}
                </div>
                <p className="text-stone-300 leading-relaxed whitespace-pre-wrap">{selectedInquiry.message}</p>
              </div>

              {selectedInquiry.notes && (
                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-amber-300">
                  <p className="text-[10px] font-bold uppercase">Staff Resolution Notes:</p>
                  <p className="text-xs mt-0.5">{selectedInquiry.notes}</p>
                </div>
              )}

              <div className="text-[11px] text-stone-500 flex justify-between pt-2">
                <span>Received: {new Date(selectedInquiry.createdAt).toLocaleString('en-IN')}</span>
                {selectedInquiry.resolvedAt && (
                  <span>Resolved: {new Date(selectedInquiry.resolvedAt).toLocaleString('en-IN')}</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2 border-t border-stone-800">
              <a
                href={`https://wa.me/91${selectedInquiry.phone?.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(selectedInquiry.name)},%20thank%20you%20for%20contacting%20SwadGhar!`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Reply on WhatsApp</span>
              </a>

              <button
                onClick={() => {
                  setStatusModalInquiry(selectedInquiry);
                  setNewStatus(selectedInquiry.status);
                  setStaffNote(selectedInquiry.notes || '');
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors"
              >
                Change Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {statusModalInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <form onSubmit={handleUpdateStatus} className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 text-stone-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-serif font-bold text-base text-white">Update Inquiry Status</h3>
              <button
                type="button"
                onClick={() => setStatusModalInquiry(null)}
                className="p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-stone-400">
                Inquiry from <strong className="text-white">{statusModalInquiry.name}</strong> regarding <strong className="text-white">"{statusModalInquiry.subject}"</strong>.
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-300">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value="new">New (Unread / Pending)</option>
                  <option value="in_progress">In Progress (Staff Contacting Customer)</option>
                  <option value="resolved">Resolved (Complete)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-300">Staff Resolution Notes</label>
                <textarea
                  rows={3}
                  value={staffNote}
                  onChange={(e) => setStaffNote(e.target.value)}
                  placeholder="e.g. Called customer at 3 PM, provided banquet quote for 50 pax on Oct 12..."
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 text-xs focus:outline-none focus:border-amber-500 resize-none"
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setStatusModalInquiry(null)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-all shadow-md"
              >
                {updating ? 'Saving...' : 'Save Status'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminInquiries;
