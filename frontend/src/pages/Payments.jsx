import React, { useState, useEffect } from 'react';
import { paymentAPI, bookingAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';
import { CreditCard, Search, Plus, Edit2, Trash2, IndianRupee, Calendar, CheckCircle2, X } from 'lucide-react';

export const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Bookings list for dropdown
  const [bookingsList, setBookingsList] = useState([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [formData, setFormData] = useState({
    booking_id: '',
    customer_id: '',
    amount: 3500,
    payment_method: 'UPI',
    payment_date: new Date().toISOString().split('T')[0],
    status: 'Paid',
    transaction_reference: ''
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchPayments(1);
    fetchBookingsList();
  }, [search, statusFilter, methodFilter]);

  const fetchPayments = async (page = 1) => {
    setLoading(true);
    try {
      const res = await paymentAPI.getPayments({
        search,
        status: statusFilter,
        paymentMethod: methodFilter,
        page,
        limit: 10
      });
      if (res.success) {
        setPayments(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Error loading payments' });
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingsList = async () => {
    try {
      const res = await bookingAPI.getBookings({ limit: 100 });
      if (res.success) setBookingsList(res.data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  const handleBookingSelect = (bId) => {
    const b = bookingsList.find((x) => x.booking_id === bId);
    if (b) {
      setFormData((prev) => ({
        ...prev,
        booking_id: b.booking_id,
        customer_id: b.customer_id,
        amount: b.estimated_cost || 2500,
        transaction_reference: 'UPI-TXN-' + Math.floor(100000 + Math.random() * 900000)
      }));
    } else {
      setFormData((prev) => ({ ...prev, booking_id: bId }));
    }
  };

  const handleOpenAddModal = () => {
    setEditingPayment(null);
    const firstB = bookingsList.length > 0 ? bookingsList[0] : null;
    setFormData({
      booking_id: firstB ? firstB.booking_id : '',
      customer_id: firstB ? firstB.customer_id : '',
      amount: firstB ? firstB.estimated_cost : 3500,
      payment_method: 'UPI',
      payment_date: new Date().toISOString().split('T')[0],
      status: 'Paid',
      transaction_reference: 'TXN' + Math.floor(100000000 + Math.random() * 900000000)
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p) => {
    setEditingPayment(p);
    setFormData({
      booking_id: p.booking_id,
      customer_id: p.customer_id,
      amount: p.amount,
      payment_method: p.payment_method,
      payment_date: p.payment_date ? p.payment_date.split('T')[0] : new Date().toISOString().split('T')[0],
      status: p.status,
      transaction_reference: p.transaction_reference || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      if (editingPayment) {
        const res = await paymentAPI.updatePayment(editingPayment.payment_id, formData);
        if (res.success) {
          setToast({ type: 'success', message: 'Payment updated successfully.' });
          setIsModalOpen(false);
          fetchPayments(pagination.page);
        }
      } else {
        const res = await paymentAPI.createPayment(formData);
        if (res.success) {
          setToast({ type: 'success', message: 'Payment recorded successfully.' });
          setIsModalOpen(false);
          fetchPayments(1);
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
      const res = await paymentAPI.deletePayment(deleteTarget.payment_id);
      if (res.success) {
        setToast({ type: 'success', message: 'Payment deleted successfully.' });
        setDeleteTarget(null);
        fetchPayments(pagination.page);
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to delete payment' });
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
            <CreditCard className="w-6 h-6 text-blue-600" /> Billing & Payment Transactions
          </h2>
          <p className="text-xs text-slate-500">Track invoices, payment methods (UPI, Cash, Cards), and transaction references.</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/25 transition-all"
        >
          <Plus className="w-4 h-4" /> Record New Payment
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
            placeholder="Search payment ID (PAY-1001), transaction ref, customer..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white"
          >
            <option value="">All Payment Methods</option>
            <option value="UPI">UPI</option>
            <option value="Cash">Cash</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Debit Card">Debit Card</option>
            <option value="Net Banking">Net Banking</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white"
          >
            <option value="">All Statuses</option>
            <option value="Paid">Paid 🟢</option>
            <option value="Pending">Pending 🟡</option>
            <option value="Failed">Failed 🔴</option>
            <option value="Refunded">Refunded 🟠</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Fetching payment transactions from database..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-6">Payment ID</th>
                  <th className="py-3 px-6">Customer & Booking</th>
                  <th className="py-3 px-6">Amount</th>
                  <th className="py-3 px-6">Payment Method</th>
                  <th className="py-3 px-6">Txn Reference</th>
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-slate-400 font-medium">
                      No payments found.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.payment_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-6 font-mono font-black text-blue-600">{p.payment_id}</td>
                      <td className="py-3.5 px-6">
                        <div className="font-bold text-slate-800">{p.customer_name}</div>
                        <div className="text-[10px] font-mono text-slate-400">Booking: {p.booking_id}</div>
                      </td>
                      <td className="py-3.5 px-6 font-mono font-black text-slate-900 text-sm">
                        ₹{Number(p.amount).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-6 font-bold text-slate-700">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs">
                          {p.payment_method}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 font-mono text-slate-500 text-[11px] truncate max-w-[150px]">
                        {p.transaction_reference || 'N/A'}
                      </td>
                      <td className="py-3.5 px-6 font-medium text-slate-600">
                        {p.payment_date ? p.payment_date.split('T')[0] : ''}
                      </td>
                      <td className="py-3.5 px-6"><StatusBadge status={p.status} /></td>
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Payment"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(p)}
                            className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Payment"
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

        <Pagination pagination={pagination} onPageChange={(p) => fetchPayments(p)} />
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">
                {editingPayment ? 'Edit Payment Record' : 'Record Payment Invoice'}
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
                      {b.booking_id} - {b.customer_name} (₹{b.estimated_cost})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Net Banking">Net Banking</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Payment Date</label>
                  <input
                    type="date"
                    required
                    value={formData.payment_date}
                    onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
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
                    <option value="Paid">Paid 🟢</option>
                    <option value="Pending">Pending 🟡</option>
                    <option value="Failed">Failed 🔴</option>
                    <option value="Refunded">Refunded 🟠</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Transaction Reference / UTR</label>
                <input
                  type="text"
                  value={formData.transaction_reference}
                  onChange={(e) => setFormData({ ...formData, transaction_reference: e.target.value })}
                  placeholder="e.g. UPI-TXN-981248"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:bg-white"
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
                  {submitLoading ? 'Saving...' : editingPayment ? 'Update Payment' : 'Save Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Payment"
        message={`Are you sure you want to delete payment record ${deleteTarget?.payment_id}?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </div>
  );
};

export default Payments;
