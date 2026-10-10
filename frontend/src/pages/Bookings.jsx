import React, { useState, useEffect } from 'react';
import { bookingAPI, customerAPI, vehicleAPI, mechanicAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';
import { Calendar, Search, Plus, Edit2, Trash2, Clock, User, Car, Wrench, IndianRupee, X } from 'lucide-react';

export const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Dropdown options
  const [customers, setCustomers] = useState([]);
  const [customerVehicles, setCustomerVehicles] = useState([]);
  const [availableMechanics, setAvailableMechanics] = useState([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [formData, setFormData] = useState({
    customer_id: '',
    vehicle_id: '',
    mechanic_id: '',
    service_type: 'Full Periodic Service',
    booking_date: new Date().toISOString().split('T')[0],
    booking_time: '10:00',
    problem_description: '',
    estimated_cost: 2500,
    status: 'Pending'
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchBookings(1);
    fetchInitialDropdowns();
  }, [search, statusFilter]);

  const fetchBookings = async (page = 1) => {
    setLoading(true);
    try {
      const res = await bookingAPI.getBookings({ search, status: statusFilter, page, limit: 10 });
      if (res.success) {
        setBookings(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Error loading bookings' });
    } finally {
      setLoading(false);
    }
  };

  const fetchInitialDropdowns = async () => {
    try {
      const [cRes, mRes] = await Promise.all([
        customerAPI.getCustomers({ limit: 100 }),
        mechanicAPI.getAvailableMechanics()
      ]);
      if (cRes.success) setCustomers(cRes.data);
      if (mRes.success) setAvailableMechanics(mRes.data);
    } catch (err) {
      console.error('Error fetching booking dropdown options:', err);
    }
  };

  const handleCustomerChange = async (cId) => {
    setFormData((prev) => ({ ...prev, customer_id: cId, vehicle_id: '' }));
    if (!cId) {
      setCustomerVehicles([]);
      return;
    }
    try {
      const vRes = await vehicleAPI.getVehiclesByCustomer(cId);
      if (vRes.success) {
        setCustomerVehicles(vRes.data);
        if (vRes.data.length > 0) {
          setFormData((prev) => ({ ...prev, vehicle_id: vRes.data[0].vehicle_id }));
        }
      }
    } catch (err) {
      console.error('Error fetching customer vehicles:', err);
    }
  };

  const handleOpenAddModal = () => {
    setEditingBooking(null);
    const defaultCustId = customers.length > 0 ? customers[0].customer_id : '';
    setFormData({
      customer_id: defaultCustId,
      vehicle_id: '',
      mechanic_id: availableMechanics.length > 0 ? availableMechanics[0].mechanic_id : '',
      service_type: 'Full Periodic Service',
      booking_date: new Date().toISOString().split('T')[0],
      booking_time: '10:00',
      problem_description: 'Standard periodic checkup and oil replacement.',
      estimated_cost: 3500,
      status: 'Pending'
    });
    if (defaultCustId) handleCustomerChange(defaultCustId);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = async (b) => {
    setEditingBooking(b);
    setFormData({
      customer_id: b.customer_id,
      vehicle_id: b.vehicle_id,
      mechanic_id: b.mechanic_id || '',
      service_type: b.service_type,
      booking_date: b.booking_date ? b.booking_date.split('T')[0] : new Date().toISOString().split('T')[0],
      booking_time: b.booking_time || '10:00',
      problem_description: b.problem_description || '',
      estimated_cost: b.estimated_cost || 0,
      status: b.status
    });

    if (b.customer_id) {
      try {
        const vRes = await vehicleAPI.getVehiclesByCustomer(b.customer_id);
        if (vRes.success) setCustomerVehicles(vRes.data);
      } catch (err) {
        console.error('Error loading vehicles for edit modal:', err);
      }
    }

    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleQuickStatusChange = async (bookingId, newStatus) => {
    try {
      const res = await bookingAPI.updateBookingStatus(bookingId, newStatus);
      if (res.success) {
        setToast({ type: 'success', message: `Booking status updated to ${newStatus}.` });
        fetchBookings(pagination.page);
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to update status' });
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setFormErrors({});

    try {
      if (editingBooking) {
        const res = await bookingAPI.updateBooking(editingBooking.booking_id, formData);
        if (res.success) {
          setToast({ type: 'success', message: 'Booking updated successfully.' });
          setIsModalOpen(false);
          fetchBookings(pagination.page);
        }
      } else {
        const res = await bookingAPI.createBooking(formData);
        if (res.success) {
          setToast({ type: 'success', message: 'Booking created successfully.' });
          setIsModalOpen(false);
          fetchBookings(1);
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
      const res = await bookingAPI.deleteBooking(deleteTarget.booking_id);
      if (res.success) {
        setToast({ type: 'success', message: 'Booking deleted successfully.' });
        setDeleteTarget(null);
        fetchBookings(pagination.page);
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to delete booking' });
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
            <Calendar className="w-6 h-6 text-blue-600" /> Service Bookings
          </h2>
          <p className="text-xs text-slate-500">Schedule appointments, assign technicians, and track progress.</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/25 transition-all"
        >
          <Plus className="w-4 h-4" /> Create New Booking
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
            placeholder="Search booking ID (VS-1001), customer, vehicle reg..."
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
            <option value="Pending">Pending 🟡</option>
            <option value="Confirmed">Confirmed 🔵</option>
            <option value="In Progress">In Progress 🟣</option>
            <option value="Completed">Completed 🟢</option>
            <option value="Cancelled">Cancelled 🔴</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Fetching bookings from database..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-6">Booking ID</th>
                  <th className="py-3 px-6">Customer & Vehicle</th>
                  <th className="py-3 px-6">Service Type</th>
                  <th className="py-3 px-6">Date & Time</th>
                  <th className="py-3 px-6">Assigned Mechanic</th>
                  <th className="py-3 px-6">Est. Cost</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-slate-400 font-medium">
                      No bookings found.
                    </td>
                  </tr>
                ) : (
                  bookings.map((b) => (
                    <tr key={b.booking_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-6 font-mono font-black text-blue-600">{b.booking_id}</td>
                      <td className="py-3.5 px-6">
                        <div className="font-bold text-slate-800">{b.customer_name}</div>
                        <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1 mt-0.5">
                          <Car className="w-3 h-3 text-slate-400" /> {b.registration_number} ({b.vehicle_brand})
                        </div>
                      </td>
                      <td className="py-3.5 px-6 font-semibold text-slate-700">{b.service_type}</td>
                      <td className="py-3.5 px-6">
                        <div className="font-medium text-slate-800 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" /> {b.booking_date ? b.booking_date.split('T')[0] : ''}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" /> {b.booking_time}
                        </div>
                      </td>
                      <td className="py-3.5 px-6 font-medium text-slate-700">
                        {b.mechanic_name ? (
                          <span className="flex items-center gap-1 text-slate-800">
                            <Wrench className="w-3 h-3 text-blue-500" /> {b.mechanic_name}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 font-mono font-bold text-slate-800">
                        ₹{Number(b.estimated_cost).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-6">
                        <select
                          value={b.status}
                          onChange={(e) => handleQuickStatusChange(b.booking_id, e.target.value)}
                          className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
                        >
                          <option value="Pending">🟡 Pending</option>
                          <option value="Confirmed">🔵 Confirmed</option>
                          <option value="In Progress">🟣 In Progress</option>
                          <option value="Completed">🟢 Completed</option>
                          <option value="Cancelled">🔴 Cancelled</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(b)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Booking"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(b)}
                            className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Booking"
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

        <Pagination pagination={pagination} onPageChange={(p) => fetchBookings(p)} />
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">
                {editingBooking ? 'Edit Booking Request' : 'Create New Booking'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Customer</label>
                  <select
                    required
                    value={formData.customer_id}
                    onChange={(e) => handleCustomerChange(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
                  >
                    <option value="">-- Choose Customer --</option>
                    {customers.map((c) => (
                      <option key={c.customer_id} value={c.customer_id}>
                        {c.name} ({c.customer_id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle</label>
                  <select
                    required
                    value={formData.vehicle_id}
                    onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
                  >
                    <option value="">-- Choose Vehicle --</option>
                    {customerVehicles.map((v) => (
                      <option key={v.vehicle_id} value={v.vehicle_id}>
                        {v.registration_number} - {v.brand} {v.model}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Service Type</label>
                  <select
                    value={formData.service_type}
                    onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
                  >
                    <option value="Full Periodic Service">Full Periodic Service</option>
                    <option value="Engine Oil Change & Filter">Engine Oil Change & Filter</option>
                    <option value="AC Deep Cleaning & Gas Refill">AC Deep Cleaning & Gas Refill</option>
                    <option value="Brake Pad Replacement & Bleeding">Brake Pad Replacement & Bleeding</option>
                    <option value="Wheel Alignment & Balancing">Wheel Alignment & Balancing</option>
                    <option value="Battery Replacement & Testing">Battery Replacement & Testing</option>
                    <option value="Clutch Plate Overhaul">Clutch Plate Overhaul</option>
                    <option value="Car Wash & Interior Detailing">Car Wash & Interior Detailing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assign Mechanic</label>
                  <select
                    value={formData.mechanic_id}
                    onChange={(e) => setFormData({ ...formData, mechanic_id: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
                  >
                    <option value="">-- Unassigned --</option>
                    {availableMechanics.map((m) => (
                      <option key={m.mechanic_id} value={m.mechanic_id}>
                        {m.name} ({m.specialization}) - {m.status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.booking_date}
                    onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Time</label>
                  <input
                    type="time"
                    required
                    value={formData.booking_time}
                    onChange={(e) => setFormData({ ...formData, booking_time: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Est. Cost (₹)</label>
                  <input
                    type="number"
                    value={formData.estimated_cost}
                    onChange={(e) => setFormData({ ...formData, estimated_cost: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Problem Description</label>
                <textarea
                  rows="2"
                  value={formData.problem_description}
                  onChange={(e) => setFormData({ ...formData, problem_description: e.target.value })}
                  placeholder="Describe issues observed by customer..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
                >
                  <option value="Pending">Pending 🟡</option>
                  <option value="Confirmed">Confirmed 🔵</option>
                  <option value="In Progress">In Progress 🟣</option>
                  <option value="Completed">Completed 🟢</option>
                  <option value="Cancelled">Cancelled 🔴</option>
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
                  {submitLoading ? 'Saving...' : editingBooking ? 'Update Booking' : 'Save Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Booking"
        message={`Are you sure you want to delete booking ${deleteTarget?.booking_id}?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </div>
  );
};

export default Bookings;
