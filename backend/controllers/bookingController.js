const Booking = require('../models/Booking');
const Customer = require('../models/Customer');
const Vehicle = require('../models/Vehicle');
const Mechanic = require('../models/Mechanic');
const { generateUniqueId } = require('../utils/generateId');

const getBookings = async (req, res, next) => {
  try {
    const { search, status, date, page, limit } = req.query;
    const result = await Booking.findAll({ search, status, date, page, limit });

    return res.json({
      success: true,
      message: 'Bookings retrieved successfully',
      data: result.bookings,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

const getTodayBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.findToday();
    return res.json({
      success: true,
      message: 'Today bookings retrieved successfully',
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

const getUpcomingBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.findUpcoming();
    return res.json({
      success: true,
      message: 'Upcoming bookings retrieved successfully',
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByBookingId(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    return res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

const createBooking = async (req, res, next) => {
  try {
    const {
      customer_id, vehicle_id, mechanic_id, service_type,
      booking_date, booking_time, problem_description, estimated_cost, status
    } = req.body;

    const errors = {};
    if (!customer_id) errors.customer_id = 'Customer selection is required';
    if (!vehicle_id) errors.vehicle_id = 'Vehicle selection is required';
    if (!service_type || service_type.trim() === '') errors.service_type = 'Service type is required';
    if (!booking_date) errors.booking_date = 'Booking date is required';
    if (!booking_time) errors.booking_time = 'Booking time is required';

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // 1. Validate Customer
    const customer = await Customer.findByCustomerId(customer_id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer does not exist'
      });
    }

    // 2. Validate Vehicle
    const vehicle = await Vehicle.findByVehicleId(vehicle_id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle does not exist'
      });
    }

    // 3. Validate Mechanic if assigned
    if (mechanic_id) {
      const mechanic = await Mechanic.findByMechanicId(mechanic_id);
      if (!mechanic) {
        return res.status(404).json({
          success: false,
          message: 'Selected mechanic does not exist'
        });
      }
      if (mechanic.status === 'Inactive') {
        return res.status(400).json({
          success: false,
          message: 'Selected mechanic is inactive'
        });
      }
      if (status === 'In Progress') {
        await Mechanic.updateStatus(mechanic_id, 'Busy');
      }
    }

    const booking_id = await generateUniqueId('bookings', 'booking_id', 'VS', 1000);
    await Booking.create({
      booking_id, customer_id, vehicle_id, mechanic_id, service_type,
      booking_date, booking_time, problem_description, estimated_cost, status: status || 'Pending'
    });

    const newBooking = await Booking.findByBookingId(booking_id);

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: newBooking
    });
  } catch (error) {
    next(error);
  }
};

const updateBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      customer_id, vehicle_id, mechanic_id, service_type,
      booking_date, booking_time, problem_description, estimated_cost, status
    } = req.body;

    const updated = await Booking.update(id, {
      customer_id, vehicle_id, mechanic_id, service_type,
      booking_date, booking_time, problem_description, estimated_cost, status
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or no changes made'
      });
    }

    if (mechanic_id) {
      if (status === 'In Progress') {
        await Mechanic.updateStatus(mechanic_id, 'Busy');
      } else if (status === 'Completed' || status === 'Cancelled') {
        await Mechanic.updateStatus(mechanic_id, 'Available');
      }
    }

    const booking = await Booking.findByBookingId(id);

    return res.json({
      success: true,
      message: 'Booking updated successfully',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const booking = await Booking.findByBookingId(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    await Booking.updateStatus(id, status);

    if (booking.mechanic_id) {
      if (status === 'In Progress') {
        await Mechanic.updateStatus(booking.mechanic_id, 'Busy');
      } else if (status === 'Completed' || status === 'Cancelled') {
        await Mechanic.updateStatus(booking.mechanic_id, 'Available');
      }
    }

    const updatedBooking = await Booking.findByBookingId(id);

    return res.json({
      success: true,
      message: `Booking status updated to ${status}`,
      data: updatedBooking
    });
  } catch (error) {
    next(error);
  }
};

const deleteBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Booking.delete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    return res.json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBookings,
  getTodayBookings,
  getUpcomingBookings,
  getBookingById,
  createBooking,
  updateBooking,
  updateBookingStatus,
  deleteBooking
};
