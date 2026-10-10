const Mechanic = require('../models/Mechanic');
const { generateUniqueId } = require('../utils/generateId');

const getMechanics = async (req, res, next) => {
  try {
    const { search, status, specialization, page, limit } = req.query;
    const result = await Mechanic.findAll({ search, status, specialization, page, limit });

    return res.json({
      success: true,
      message: 'Mechanics retrieved successfully',
      data: result.mechanics,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

const getAvailableMechanics = async (req, res, next) => {
  try {
    const mechanics = await Mechanic.findAvailable();
    return res.json({
      success: true,
      message: 'Available mechanics retrieved successfully',
      data: mechanics
    });
  } catch (error) {
    next(error);
  }
};

const getMechanicById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mechanic = await Mechanic.findByMechanicId(id);
    if (!mechanic) {
      return res.status(404).json({
        success: false,
        message: 'Mechanic not found'
      });
    }

    return res.json({
      success: true,
      data: mechanic
    });
  } catch (error) {
    next(error);
  }
};

const createMechanic = async (req, res, next) => {
  try {
    const { name, phone, email, specialization, experience, joining_date, status } = req.body;

    const errors = {};
    if (!name || name.trim() === '') errors.name = 'Mechanic name is required';
    if (!phone || phone.trim() === '') errors.phone = 'Phone number is required';

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    const mechanic_id = await generateUniqueId('mechanics', 'mechanic_id', 'MEC', 1000);
    await Mechanic.create({
      mechanic_id, name, phone, email, specialization, experience, joining_date, status
    });

    const newMechanic = await Mechanic.findByMechanicId(mechanic_id);

    return res.status(201).json({
      success: true,
      message: 'Mechanic created successfully',
      data: newMechanic
    });
  } catch (error) {
    next(error);
  }
};

const updateMechanic = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, phone, email, specialization, experience, joining_date, status } = req.body;

    const errors = {};
    if (!name || name.trim() === '') errors.name = 'Mechanic name is required';
    if (!phone || phone.trim() === '') errors.phone = 'Phone number is required';

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    const updated = await Mechanic.update(id, {
      name, phone, email, specialization, experience, joining_date, status
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Mechanic not found or no changes made'
      });
    }

    const mechanic = await Mechanic.findByMechanicId(id);

    return res.json({
      success: true,
      message: 'Mechanic updated successfully',
      data: mechanic
    });
  } catch (error) {
    next(error);
  }
};

const deleteMechanic = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Mechanic.delete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Mechanic not found'
      });
    }

    return res.json({
      success: true,
      message: 'Mechanic deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMechanics,
  getAvailableMechanics,
  getMechanicById,
  createMechanic,
  updateMechanic,
  deleteMechanic
};
