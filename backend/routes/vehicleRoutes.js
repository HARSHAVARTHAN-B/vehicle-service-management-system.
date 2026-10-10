const express = require('express');
const router = express.Router();
const {
  getVehicles,
  getVehicleById,
  getVehiclesByCustomer,
  createVehicle,
  updateVehicle,
  deleteVehicle
} = require('../controllers/vehicleController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getVehicles);
router.get('/customer/:customerId', getVehiclesByCustomer);
router.get('/:id', getVehicleById);
router.post('/', createVehicle);
router.put('/:id', updateVehicle);
router.delete('/:id', deleteVehicle);

module.exports = router;
