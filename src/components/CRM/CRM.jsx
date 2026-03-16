import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, X, User, Phone, MapPin, FileText, StickyNote } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API = import.meta.env.VITE_API_BASE_URL;

const empty = { name: '', number: '', address: '', reason: '', notes: '' };

const CRM = () => {
  useAuth(); // ensure user is authenticated
  const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchCustomers = async (q = '') => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API}/api/crm/all`, {
        headers,
        params: q ? { search: q } : {},
      });
      setCustomers(data.customers || []);
    } catch {
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchCustomers(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const openAdd = () => { setForm(empty); setEditCustomer(null); setShowModal(true); };
  const openEdit = (c) => {
    setForm({ name: c.name, number: c.number, address: c.address || '', reason: c.reason || '', notes: c.notes || '' });
    setEditCustomer(c);
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditCustomer(null); setForm(empty); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editCustomer) {
        await axios.put(`${API}/api/crm/update/${editCustomer._id}`, form, { headers });
      } else {
        await axios.post(`${API}/api/crm/add`, form, { headers });
      }
      closeModal();
      fetchCustomers(search);
    } catch (err) {
      alert(err.response?.data?.error || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/api/crm/delete/${deleteId}`, { headers });
      setDeleteId(null);
      fetchCustomers(search);
    } catch (err) {
      alert(err.response?.data?.error || 'Delete failed');
    }
  };

  const fields = [
    { key: 'name', label: 'Customer Name', icon: User, placeholder: 'Enter full name', required: true },
    { key: 'number', label: 'Phone Number', icon: Phone, placeholder: 'Enter phone number', required: true },
    { key: 'address', label: 'Address', icon: MapPin, placeholder: 'Enter address' },
    { key: 'reason', label: 'Reason', icon: FileText, placeholder: 'Reason for contact' },
    { key: 'notes', label: 'Notes', icon: StickyNote, placeholder: 'Additional notes', textarea: true },
  ];

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-gray-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-800">CRM</h1>
          <p className="text-sm text-gray-500 mt-1">Manage customer relationships</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={openAdd}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg font-semibold text-sm"
        >
          <Plus className="w-4 h-4" /> Add Customer
        </motion.button>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative mb-4 max-w-md"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, number or reason..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />
      </motion.div>

      {/* Count */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="mb-4 text-sm text-gray-500"
      >
        {!loading && `${customers.length} customer${customers.length !== 1 ? 's' : ''} found`}
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm">Loading...</div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <User className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">No customers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['#', 'Name', 'Phone', 'Address', 'Reason', 'Notes', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {customers.map((c, i) => (
                    <motion.tr
                      key={c._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{c.name}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{c.number}</td>
                      <td className="px-4 py-3 text-gray-600 max-w-[140px] truncate">{c.address || '—'}</td>
                      <td className="px-4 py-3 text-gray-600 max-w-[140px] truncate">{c.reason || '—'}</td>
                      <td className="px-4 py-3 text-gray-600 max-w-[140px] truncate">{c.notes || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(c)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(c._id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-800">
                  {editCustomer ? 'Edit Customer' : 'Add Customer'}
                </h2>
                <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {fields.map(({ key, label, icon: Icon, placeholder, required, textarea }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
                    </label>
                    <div className="relative">
                      <Icon
                        className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none"
                        style={{ top: textarea ? '12px' : '50%', transform: textarea ? 'none' : 'translateY(-50%)' }}
                      />
                      {textarea ? (
                        <textarea
                          rows={3}
                          placeholder={placeholder}
                          value={form[key]}
                          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                        />
                      ) : (
                        <input
                          type="text"
                          placeholder={placeholder}
                          required={required}
                          value={form[key]}
                          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        />
                      )}
                    </div>
                  </div>
                ))}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    disabled={saving}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : editCustomer ? 'Update' : 'Add Customer'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setDeleteId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Customer?</h3>
              <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CRM;
