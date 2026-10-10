import React, { useState, useEffect } from 'react';
import { mechanicAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';
import { Wrench, Search, Plus, Edit2, Trash2, Phone, Mail, Award, CheckCircle2, X } from 'lucide-react';

export const Mechanics = () => {
  const [mechanics, setMechanics] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [specFilter, setSpecFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMechanic, setEditingMechanic] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    specialization: 'Engine',
    experience: '5 Years',
    status: 'Available'
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchMechanics(1);
  }, [search, statusFilter, specFilter]);

  const fetchMechanics = async (page = 1) => {
    setLoading(true);
    try {
      const res = await mechanicAPI.getMechanics({
        search,
        status: statusFilter,
        specialization: specFilter,
        page,
        limit: 10
      });
      if (res.success) {
        setMechanics(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Error loading mechanics' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingMechanic(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      specialization: 'Engine',
      experience: '5 Years',
      status: 'Available'
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (m) => {
    setEditingMechanic(m);
    setFormData({
      name: m.name,
      phone: m.phone,
      email: m.email || '',
      specialization: m.specialization,
      experience: m.experience || '3 Years',
      status: m.status
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setFormErrors({});

    try {
      if (editingMechanic) {
        const res = await mechanicAPI.updateMechanic(editingMechanic.mechanic_id, formData);
        if (res.success) {
          setToast({ type: 'success', message: 'Mechanic updated successfully.' });
          setIsModalOpen(false);
          fetchMechanics(pagination.page);
        }
      } else {
        const res = await mechanicAPI.createMechanic(formData);
        if (res.success) {
          setToast({ type: 'success', message: 'Mechanic added successfully.' });
          setIsModalOpen(false);
          fetchMechanics(1);
        }
      }
    } catch (err) {
      if (err.errors) {
        setFormErrors(err.errors);
      } else {
        setToast({ type: 'error', message: err.message || 'Action failed' });
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await mechanicAPI.deleteMechanic(deleteTarget.mechanic_id);
      if (res.success) {
        setToast({ type: 'success', message: 'Mechanic deleted successfully.' });
        setDeleteTarget(null);
        fetchMechanics(pagination.page);
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to delete mechanic' });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="w-6 h-6 text-blue-600" /> Mechanic Roster
          </h2>
          <p className="text-xs text-slate-500">Manage technician specializations, availability, and active job assignments.</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/25 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Mechanic
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search mechanic name, phone, specialization..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={specFilter}
            onChange={(e) => setSpecFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white"
          >
            <option value="">All Specializations</option>
            <option value="Engine">Engine</option>
            <option value="Electrical">Electrical</option>
            <option value="Brakes">Brakes</option>
            <option value="AC">AC</option>
            <option value="Transmission">Transmission</option>
            <option value="General Service">General Service</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white"
          >
            <option value="">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Busy">Busy</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Mechanics Grid / Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Fetching mechanics from database..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-6">Mechanic ID</th>
                  <th className="py-3 px-6">Name</th>
                  <th className="py-3 px-6">Specialization</th>
                  <th className="py-3 px-6">Experience</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Active Jobs</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {mechanics.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400 font-medium">
                      No mechanics found.
                    </td>
                  </tr>
                ) : (
                  mechanics.map((m) => (
                    <tr key={m.mechanic_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-6 font-mono font-bold text-blue-600">{m.mechanic_id}</td>
                      <td className="py-3.5 px-6">
                        <div className="font-bold text-slate-800">{m.name}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span><Phone className="w-3 h-3 inline text-slate-400" /> {m.phone}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-6">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <Award className="w-3 h-3 text-indigo-500" /> {m.specialization}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 font-medium text-slate-700">{m.experience || '1 Year'}</td>
                      <td className="py-3.5 px-6"><StatusBadge status={m.status} /></td>
                      <td className="py-3.5 px-6 font-bold text-slate-800">
                        {m.active_tasks > 0 ? (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-md text-[10px]">
                            {m.active_tasks} Active Booking(s)
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px] font-normal">None</span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(m)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Mechanic"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(m)}
                            className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Mechanic"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <Pagination pagination={pagination} onPageChange={(p) => fetchMechanics(p)} />
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">
                {editingMechanic ? 'Edit Mechanic Details' : 'Add New Mechanic'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mechanic Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ramesh Sundaram"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 97890 12345"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ramesh@autocare.com"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Specialization</label>
                  <select
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
                  >
                    <option value="Engine">Engine</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Brakes">Brakes</option>
                    <option value="AC">AC</option>
                    <option value="Transmission">Transmission</option>
                    <option value="General Service">General Service</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Experience</label>
                  <input
                    type="text"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    placeholder="e.g. 8 Years"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
                >
                  <option value="Available">Available 🟢</option>
                  <option value="Busy">Busy 🟣</option>
                  <option value="Inactive">Inactive 🔴</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 shadow-md shadow-blue-500/20 disabled:opacity-50"
                >
                  {submitLoading ? 'Saving...' : editingMechanic ? 'Update Mechanic' : 'Save Mechanic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Mechanic"
        message={`Are you sure you want to delete mechanic "${deleteTarget?.name}" (${deleteTarget?.mechanic_id})?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </div>
  );
};

export default Mechanics;
