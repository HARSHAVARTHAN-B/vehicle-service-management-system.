import React, { useState, useEffect } from 'react';
import { vehicleAPI, customerAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';
import { Car, Search, Plus, Edit2, Trash2, Fuel, Calendar, Gauge, User, X } from 'lucide-react';

export const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [customersList, setCustomersList] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  
  // Filters
  const [search, setSearch] = useState('');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('');
  const [fuelTypeFilter, setFuelTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    customer_id: '',
    registration_number: '',
    brand: '',
    model: '',
    vehicle_type: 'Car',
    fuel_type: 'Petrol',
    manufacturing_year: 2022,
    color: 'Polar White',
    mileage: 15000
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchVehicles(1);
    fetchCustomersDropdown();
  }, [search, vehicleTypeFilter, fuelTypeFilter]);

  const fetchVehicles = async (page = 1) => {
    setLoading(true);
    try {
      const res = await vehicleAPI.getVehicles({
        search,
        vehicleType: vehicleTypeFilter,
        fuelType: fuelTypeFilter,
        page,
        limit: 10
      });
      if (res.success) {
        setVehicles(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Error loading vehicles' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomersDropdown = async () => {
    try {
      const res = await customerAPI.getCustomers({ limit: 100 });
      if (res.success) {
        setCustomersList(res.data);
      }
    } catch (err) {
      console.error('Error fetching customers dropdown:', err);
    }
  };

  const handleOpenAddModal = () => {
    setEditingVehicle(null);
    setFormData({
      customer_id: customersList.length > 0 ? customersList[0].customer_id : '',
      registration_number: '',
      brand: '',
      model: '',
      vehicle_type: 'Car',
      fuel_type: 'Petrol',
      manufacturing_year: 2022,
      color: 'White',
      mileage: 15000
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (v) => {
    setEditingVehicle(v);
    setFormData({
      customer_id: v.customer_id,
      registration_number: v.registration_number,
      brand: v.brand,
      model: v.model,
      vehicle_type: v.vehicle_type,
      fuel_type: v.fuel_type,
      manufacturing_year: v.manufacturing_year || 2022,
      color: v.color || '',
      mileage: v.mileage || 0
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setFormErrors({});

    try {
      if (editingVehicle) {
        const res = await vehicleAPI.updateVehicle(editingVehicle.vehicle_id, formData);
        if (res.success) {
          setToast({ type: 'success', message: 'Vehicle updated successfully.' });
          setIsModalOpen(false);
          fetchVehicles(pagination.page);
        }
      } else {
        const res = await vehicleAPI.createVehicle(formData);
        if (res.success) {
          setToast({ type: 'success', message: 'Vehicle added successfully.' });
          setIsModalOpen(false);
          fetchVehicles(1);
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
      const res = await vehicleAPI.deleteVehicle(deleteTarget.vehicle_id);
      if (res.success) {
        setToast({ type: 'success', message: 'Vehicle deleted successfully.' });
        setDeleteTarget(null);
        fetchVehicles(pagination.page);
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to delete vehicle' });
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
            <Car className="w-6 h-6 text-blue-600" /> Vehicle Registry
          </h2>
          <p className="text-xs text-slate-500">Track customer vehicles, fuel types, and registration plates.</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/25 transition-all"
        >
          <Plus className="w-4 h-4" /> Add New Vehicle
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
            placeholder="Search registration plate, brand, model..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Vehicle Type Filter */}
          <select
            value={vehicleTypeFilter}
            onChange={(e) => setVehicleTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white"
          >
            <option value="">All Vehicle Types</option>
            <option value="Car">Car</option>
            <option value="Bike">Bike</option>
            <option value="SUV">SUV</option>
            <option value="Van">Van</option>
            <option value="Truck">Truck</option>
          </select>

          {/* Fuel Filter */}
          <select
            value={fuelTypeFilter}
            onChange={(e) => setFuelTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white"
          >
            <option value="">All Fuel Types</option>
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
            <option value="Electric">Electric</option>
            <option value="Hybrid">Hybrid</option>
            <option value="CNG">CNG</option>
          </select>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Fetching vehicles from database..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-6">Reg. Number</th>
                  <th className="py-3 px-6">Brand & Model</th>
                  <th className="py-3 px-6">Owner Customer</th>
                  <th className="py-3 px-6">Type & Fuel</th>
                  <th className="py-3 px-6">Mileage (km)</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {vehicles.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400 font-medium">
                      No vehicles found matching filters.
                    </td>
                  </tr>
                ) : (
                  vehicles.map((v) => (
                    <tr key={v.vehicle_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-6 font-mono font-black text-slate-900 bg-slate-50/50 rounded-lg">
                        {v.registration_number}
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="font-bold text-slate-800">{v.brand} {v.model}</div>
                        <div className="text-[10px] text-slate-400">{v.color} ({v.manufacturing_year})</div>
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-blue-500" /> {v.customer_name || 'N/A'}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">{v.customer_id}</div>
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md font-bold bg-slate-100 text-slate-700 text-[10px]">
                            {v.vehicle_type}
                          </span>
                          <span className="px-2 py-0.5 rounded-md font-bold bg-cyan-50 text-cyan-700 text-[10px] border border-cyan-200">
                            {v.fuel_type}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-6 font-mono font-medium text-slate-600">
                        {v.mileage?.toLocaleString('en-IN')} km
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(v)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Vehicle"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(v)}
                            className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Vehicle"
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

        <Pagination pagination={pagination} onPageChange={(p) => fetchVehicles(p)} />
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">
                {editingVehicle ? 'Edit Vehicle Details' : 'Add New Vehicle'}
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Owner Customer</label>
                <select
                  required
                  value={formData.customer_id}
                  onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Choose Customer --</option>
                  {customersList.map((c) => (
                    <option key={c.customer_id} value={c.customer_id}>
                      {c.name} ({c.customer_id}) - {c.phone}
                    </option>
                  ))}
                </select>
                {formErrors.customer_id && <p className="text-red-500 text-[10px] mt-1 font-semibold">{formErrors.customer_id}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Registration Number</label>
                  <input
                    type="text"
                    required
                    value={formData.registration_number}
                    onChange={(e) => setFormData({ ...formData, registration_number: e.target.value.toUpperCase() })}
                    placeholder="TN 38 AB 1234"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {formErrors.registration_number && <p className="text-red-500 text-[10px] mt-1 font-semibold">{formErrors.registration_number}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Brand</label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. Hyundai, Maruti"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Model Name</label>
                  <input
                    type="text"
                    required
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="e.g. Creta, Swift"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Type</label>
                  <select
                    value={formData.vehicle_type}
                    onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Car">Car</option>
                    <option value="Bike">Bike</option>
                    <option value="SUV">SUV</option>
                    <option value="Van">Van</option>
                    <option value="Truck">Truck</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fuel Type</label>
                  <select
                    value={formData.fuel_type}
                    onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="CNG">CNG</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Year</label>
                  <input
                    type="number"
                    value={formData.manufacturing_year}
                    onChange={(e) => setFormData({ ...formData, manufacturing_year: parseInt(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mileage (km)</label>
                  <input
                    type="number"
                    value={formData.mileage}
                    onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
                  />
                </div>
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
                  {submitLoading ? 'Saving...' : editingVehicle ? 'Update Vehicle' : 'Save Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Vehicle"
        message={`Are you sure you want to delete vehicle ${deleteTarget?.registration_number} (${deleteTarget?.brand} ${deleteTarget?.model})?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </div>
  );
};

export default Vehicles;
