const express = require('express');
const router = express.Router();
const {
  getRevenueReport,
  getBookingsReport,
  getServicesReport,
  getMechanicsReport,
  getCustomersReport
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/revenue', getRevenueReport);
router.get('/bookings', getBookingsReport);
router.get('/services', getServicesReport);
router.get('/mechanics', getMechanicsReport);
router.get('/customers', getCustomersReport);

module.exports = router;
