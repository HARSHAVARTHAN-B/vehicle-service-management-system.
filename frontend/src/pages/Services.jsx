import React, { useState, useEffect } from 'react';
import { serviceAPI, bookingAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';
import { ClipboardCheck, Search, Plus, Edit2, Trash2, IndianRupee, Wrench, Car, User, CheckCircle2, X } from 'lucide-react';

export const Services = () => {
  const [services, setServices] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Active bookings list for service record creation
  const [bookingsList, setBookingsList] = useState([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    booking_id: '',
    vehicle_id: '',
    mechanic_id: '',
    service_type: '',
    service_date: new Date().toISOString().split('T')[0],
    parts_cost: 1200,
    labor_cost: 800,
    mechanic_notes: '',
    customer_feedback: '',
    status: 'Completed'
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchServices(1);
    fetchActiveBookings();
  }, [search, statusFilter]);

  const fetchServices = async (page = 1) => {
    setLoading(true);
    try {
      const res = await serviceAPI.getServices({ search, status: statusFilter, page, limit: 10 });
      if (res.success) {
        setServices(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Error loading service records' });
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveBookings = async () => {
    try {
      const res = await bookingAPI.getBookings({ limit: 100 });
      if (res.success) {
        setBookingsList(res.data);
      }
    } catch (err) {
      console.error('Error fetching bookings list:', err);
    }
  };

  const handleBookingSelect = (bId) => {
    const selected = bookingsList.find((b) => b.booking_id === bId);
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        booking_id: selected.booking_id,
        vehicle_id: selected.vehicle_id,
        mechanic_id: selected.mechanic_id || '',
        service_type: selected.service_type,
        parts_cost: Math.round(selected.estimated_cost * 0.6),
        labor_cost: Math.round(selected.estimated_cost * 0.4)
      }));
    } else {
      setFormData((prev) => ({ ...prev, booking_id: bId }));
    }
  };

  const handleOpenAddModal = () => {
    setEditingService(null);
    const defaultBooking = bookingsList.length > 0 ? bookingsList[0] : null;
    setFormData({
      booking_id: defaultBooking ? defaultBooking.booking_id : '',
      vehicle_id: defaultBooking ? defaultBooking.vehicle_id : '',
      mechanic_id: defaultBooking ? (defaultBooking.mechanic_id || '') : '',
      service_type: defaultBooking ? defaultBooking.service_type : 'Full Periodic Service',
      service_date: new Date().toISOString().split('T')[0],
      parts_cost: 1500,
      labor_cost: 1000,
      mechanic_notes: 'Replaced genuine OEM parts. Overall performance check completed.',
      customer_feedback: 'Satisfied with quality service.',
      status: 'Completed'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (s) => {
    setEditingService(s);
    setFormData({
      booking_id: s.booking_id,
      vehicle_id: s.vehicle_id,
      mechanic_id: s.mechanic_id || '',
      service_type: s.service_type,
      service_date: s.service_date ? s.service_date.split('T')[0] : new Date().toISOString().split('T')[0],
      parts_cost: s.parts_cost || 0,
      labor_cost: s.labor_cost || 0,
      mechanic_notes: s.mechanic_notes || '',
      customer_feedback: s.customer_feedback || '',
      status: s.status
    });
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      if (editingService) {
        const res = await serviceAPI.updateService(editingService.service_id, formData);
        if (res.success) {
          setToast({ type: 'success', message: 'Service record updated successfully.' });
          setIsModalOpen(false);
          fetchServices(pagination.page);
        }
      } else {
        const res = await serviceAPI.createService(formData);
        if (res.success) {
          setToast({ type: 'success', message: 'Service record completed and saved successfully.' });
          setIsModalOpen(false);
          fetchServices(1);
        }
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Action failed' });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await serviceAPI.deleteService(deleteTarget.service_id);
      if (res.success) {
        setToast({ type: 'success', message: 'Service record deleted successfully.' });
        setDeleteTarget(null);
        fetchServices(pagination.page);
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to delete service record' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const calculatedTotal = (parseFloat(formData.parts_cost) || 0) + (parseFloat(formData.labor_cost) || 0);

  return (
    <div className="p-6 space-y-6">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-blue-600" /> Completed Service Records
          </h2>
          <p className="text-xs text-slate-500">Track parts cost, labor cost, technician notes, and customer feedback.</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/25 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Service Record
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search service ID (SRV-1001), booking, vehicle..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white"
          >
            <option value="">All Statuses</option>
            <option value="Completed">Completed 🟢</option>
            <option value="In Progress">In Progress 🟣</option>
            <option value="Pending">Pending 🟡</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Fetching service records from database..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-6">Service ID</th>
                  <th className="py-3 px-6">Booking & Vehicle</th>
                  <th className="py-3 px-6">Service Type</th>
                  <th className="py-3 px-6">Mechanic</th>
                  <th className="py-3 px-6">Parts + Labor</th>
                  <th className="py-3 px-6">Total Cost</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {services.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-slate-400 font-medium">
                      No service records found.
                    </td>
                  </tr>
                ) : (
                  services.map((s) => (
                    <tr key={s.service_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-6 font-mono font-black text-blue-600">{s.service_id}</td>
                      <td className="py-3.5 px-6">
                        <div className="font-mono text-slate-800 font-bold">{s.registration_number}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Booking: {s.booking_id}</div>
                      </td>
                      <td className="py-3.5 px-6 font-semibold text-slate-700">{s.service_type}</td>
                      <td className="py-3.5 px-6 text-slate-700 font-medium">{s.mechanic_name || 'N/A'}</td>
                      <td className="py-3.5 px-6 font-mono text-slate-500 text-[11px]">
                        ₹{Number(s.parts_cost).toLocaleString('en-IN')} + ₹{Number(s.labor_cost).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-6 font-mono font-black text-emerald-600 text-sm">
                        ₹{Number(s.total_cost).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-6"><StatusBadge status={s.status} /></td>
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(s)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Record"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(s)}
                            className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Record"
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

        <Pagination pagination={pagination} onPageChange={(p) => fetchServices(p)} />
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">
                {editingService ? 'Edit Service Record' : 'Record Completed Service'}
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Booking Reference</label>
                <select
                  required
                  value={formData.booking_id}
                  onChange={(e) => handleBookingSelect(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
                >
                  <option value="">-- Choose Booking --</option>
                  {bookingsList.map((b) => (
                    <option key={b.booking_id} value={b.booking_id}>
                      {b.booking_id} - {b.service_type} ({b.registration_number})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Parts Cost (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.parts_cost}
                    onChange={(e) => setFormData({ ...formData, parts_cost: parseFloat(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Labor Cost (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.labor_cost}
                    onChange={(e) => setFormData({ ...formData, labor_cost: parseFloat(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:bg-white"
                  />
                </div>
              </div>

              {/* Total Cost Calculated Box */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800">Calculated Total Cost:</span>
                <span className="text-base font-black text-emerald-700 font-mono">
                  ₹ {calculatedTotal.toLocaleString('en-IN')}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Technician Notes</label>
                <textarea
                  rows="2"
                  value={formData.mechanic_notes}
                  onChange={(e) => setFormData({ ...formData, mechanic_notes: e.target.value })}
                  placeholder="Notes on replaced parts, diagnostics, testing..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Customer Feedback</label>
                <input
                  type="text"
                  value={formData.customer_feedback}
                  onChange={(e) => setFormData({ ...formData, customer_feedback: e.target.value })}
                  placeholder="e.g. Smooth drive, great quality work."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
                />
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
                  {submitLoading ? 'Saving...' : editingService ? 'Update Record' : 'Complete & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Service Record"
        message={`Are you sure you want to delete service record ${deleteTarget?.service_id}?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </div>
  );
};

export default Services;
