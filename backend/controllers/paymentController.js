const Payment = require('../models/Payment');
const { generateUniqueId } = require('../utils/generateId');

const getPayments = async (req, res, next) => {
  try {
    const { search, status, paymentMethod, page, limit } = req.query;
    const result = await Payment.findAll({ search, status, paymentMethod, page, limit });

    return res.json({
      success: true,
      message: 'Payments retrieved successfully',
      data: result.payments,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

const getPaymentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findByPaymentId(id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    return res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

const createPayment = async (req, res, next) => {
  try {
    const {
      booking_id, customer_id, amount, payment_method,
      payment_date, status, transaction_reference
    } = req.body;

    const errors = {};
    if (!booking_id) errors.booking_id = 'Booking ID is required';
    if (!customer_id) errors.customer_id = 'Customer ID is required';
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) errors.amount = 'Valid positive amount is required';

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    const payment_id = await generateUniqueId('payments', 'payment_id', 'PAY', 1000);
    await Payment.create({
      payment_id, booking_id, customer_id, amount: parseFloat(amount),
      payment_method: payment_method || 'Cash',
      payment_date: payment_date || new Date().toISOString().split('T')[0],
      status: status || 'Paid', transaction_reference
    });

    const newPayment = await Payment.findByPaymentId(payment_id);

    return res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: newPayment
    });
  } catch (error) {
    next(error);
  }
};

const updatePayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      booking_id, customer_id, amount, payment_method,
      payment_date, status, transaction_reference
    } = req.body;

    const updated = await Payment.update(id, {
      booking_id, customer_id, amount: parseFloat(amount),
      payment_method, payment_date, status, transaction_reference
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found or no changes made'
      });
    }

    const payment = await Payment.findByPaymentId(id);

    return res.json({
      success: true,
      message: 'Payment updated successfully',
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

const deletePayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Payment.delete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    return res.json({
      success: true,
      message: 'Payment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment
};
