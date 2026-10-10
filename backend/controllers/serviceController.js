const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Mechanic = require('../models/Mechanic');
const { generateUniqueId } = require('../utils/generateId');

const getServices = async (req, res, next) => {
  try {
    const { search, status, page, limit } = req.query;
    const result = await Service.findAll({ search, status, page, limit });

    return res.json({
      success: true,
      message: 'Service records retrieved successfully',
      data: result.services,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

const getServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const service = await Service.findByServiceId(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service record not found'
      });
    }

    return res.json({
      success: true,
      data: service
    });
  } catch (error) {
    next(error);
  }
};

const createService = async (req, res, next) => {
  try {
    const {
      booking_id, vehicle_id, mechanic_id, service_type,
      service_date, parts_cost, labor_cost, mechanic_notes, customer_feedback, status
    } = req.body;

    const errors = {};
    if (!booking_id) errors.booking_id = 'Booking reference is required';
    if (!vehicle_id) errors.vehicle_id = 'Vehicle reference is required';
    if (!service_type) errors.service_type = 'Service type is required';

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    const service_id = await generateUniqueId('service_records', 'service_id', 'SRV', 1000);
    
    // Total cost calculation done automatically inside model constructor/query
    await Service.create({
      service_id, booking_id, vehicle_id, mechanic_id, service_type,
      service_date: service_date || new Date().toISOString().split('T')[0],
      parts_cost: parts_cost || 0, labor_cost: labor_cost || 0,
      mechanic_notes, customer_feedback, status: status || 'Completed'
    });

    const recordStatus = status || 'Completed';

    // Synchronize booking & mechanic status if completed
    if (recordStatus === 'Completed') {
      if (booking_id) {
        await Booking.updateStatus(booking_id, 'Completed');
      }
      if (mechanic_id) {
        await Mechanic.updateStatus(mechanic_id, 'Available');
      }
    }

    const newService = await Service.findByServiceId(service_id);

    return res.status(201).json({
      success: true,
      message: 'Service record created successfully',
      data: newService
    });
  } catch (error) {
    next(error);
  }
};

const updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      booking_id, vehicle_id, mechanic_id, service_type,
      service_date, parts_cost, labor_cost, mechanic_notes, customer_feedback, status
    } = req.body;

    const updated = await Service.update(id, {
      booking_id, vehicle_id, mechanic_id, service_type,
      service_date, parts_cost: parts_cost || 0, labor_cost: labor_cost || 0,
      mechanic_notes, customer_feedback, status
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Service record not found or no changes made'
      });
    }

    if (status === 'Completed') {
      if (booking_id) {
        await Booking.updateStatus(booking_id, 'Completed');
      }
      if (mechanic_id) {
        await Mechanic.updateStatus(mechanic_id, 'Available');
      }
    }

    const service = await Service.findByServiceId(id);

    return res.json({
      success: true,
      message: 'Service record updated successfully',
      data: service
    });
  } catch (error) {
    next(error);
  }
};

const deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Service.delete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Service record not found'
      });
    }

    return res.json({
      success: true,
      message: 'Service record deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService
};
