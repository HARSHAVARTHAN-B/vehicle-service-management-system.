const Vehicle = require('../models/Vehicle');
const Customer = require('../models/Customer');
const { generateUniqueId } = require('../utils/generateId');

const getVehicles = async (req, res, next) => {
  try {
    const { search, customerId, vehicleType, fuelType, page, limit } = req.query;
    const result = await Vehicle.findAll({ search, customerId, vehicleType, fuelType, page, limit });

    return res.json({
      success: true,
      message: 'Vehicles retrieved successfully',
      data: result.vehicles,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

const getVehicleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findByVehicleId(id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    return res.json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    next(error);
  }
};

const getVehiclesByCustomer = async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const vehicles = await Vehicle.findByCustomerId(customerId);

    return res.json({
      success: true,
      data: vehicles
    });
  } catch (error) {
    next(error);
  }
};

const createVehicle = async (req, res, next) => {
  try {
    const {
      customer_id, registration_number, brand, model,
      vehicle_type, fuel_type, manufacturing_year, color, mileage
    } = req.body;

    const errors = {};
    if (!customer_id) errors.customer_id = 'Customer selection is required';
    if (!registration_number || registration_number.trim() === '') errors.registration_number = 'Registration number is required';
    if (!brand || brand.trim() === '') errors.brand = 'Brand is required';
    if (!model || model.trim() === '') errors.model = 'Model is required';

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Validate customer existence
    const customerExists = await Customer.findByCustomerId(customer_id);
    if (!customerExists) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found. Please select a valid customer.'
      });
    }

    const vehicle_id = await generateUniqueId('vehicles', 'vehicle_id', 'VEH', 1000);
    await Vehicle.create({
      vehicle_id, customer_id, registration_number: registration_number.toUpperCase(), brand, model,
      vehicle_type, fuel_type, manufacturing_year, color, mileage
    });

    const newVehicle = await Vehicle.findByVehicleId(vehicle_id);

    return res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data: newVehicle
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'Vehicle registration number already registered'
      });
    }
    next(error);
  }
};

const updateVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      customer_id, registration_number, brand, model,
      vehicle_type, fuel_type, manufacturing_year, color, mileage
    } = req.body;

    const errors = {};
    if (!customer_id) errors.customer_id = 'Customer is required';
    if (!registration_number || registration_number.trim() === '') errors.registration_number = 'Registration number is required';
    if (!brand || brand.trim() === '') errors.brand = 'Brand is required';
    if (!model || model.trim() === '') errors.model = 'Model is required';

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    const updated = await Vehicle.update(id, {
      customer_id, registration_number: registration_number.toUpperCase(), brand, model,
      vehicle_type, fuel_type, manufacturing_year, color, mileage
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found or no changes made'
      });
    }

    const vehicle = await Vehicle.findByVehicleId(id);

    return res.json({
      success: true,
      message: 'Vehicle updated successfully',
      data: vehicle
    });
  } catch (error) {
    next(error);
  }
};

const deleteVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Vehicle.delete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    return res.json({
      success: true,
      message: 'Vehicle deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVehicles,
  getVehicleById,
  getVehiclesByCustomer,
  createVehicle,
  updateVehicle,
  deleteVehicle
};
