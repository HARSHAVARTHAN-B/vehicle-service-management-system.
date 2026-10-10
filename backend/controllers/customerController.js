const Customer = require('../models/Customer');
const { generateUniqueId } = require('../utils/generateId');

const getCustomers = async (req, res, next) => {
  try {
    const { search, page, limit } = req.query;
    const result = await Customer.findAll({ search, page, limit });
    return res.json({
      success: true,
      message: 'Customers retrieved successfully',
      data: result.customers,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

const getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findByCustomerId(id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    return res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    next(error);
  }
};

const createCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, address } = req.body;

    const errors = {};
    if (!name || name.trim() === '') errors.name = 'Customer name is required';
    if (!email || !email.includes('@')) errors.email = 'Valid email is required';
    if (!phone || phone.trim().length < 7) errors.phone = 'Valid phone number is required';

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    const customer_id = await generateUniqueId('customers', 'customer_id', 'CUS', 1000);
    await Customer.create({ customer_id, name, email, phone, address });
    const newCustomer = await Customer.findByCustomerId(customer_id);

    return res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: newCustomer
    });
  } catch (error) {
    next(error);
  }
};

const updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address } = req.body;

    const errors = {};
    if (!name || name.trim() === '') errors.name = 'Customer name is required';
    if (!email || !email.includes('@')) errors.email = 'Valid email is required';
    if (!phone || phone.trim().length < 7) errors.phone = 'Valid phone number is required';

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    const updated = await Customer.update(id, { name, email, phone, address });
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found or no changes made'
      });
    }

    const customer = await Customer.findByCustomerId(id);

    return res.json({
      success: true,
      message: 'Customer updated successfully',
      data: customer
    });
  } catch (error) {
    next(error);
  }
};

const deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Customer.delete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    return res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
};
