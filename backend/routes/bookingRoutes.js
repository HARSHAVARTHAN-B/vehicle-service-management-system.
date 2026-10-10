const express = require('express');
const router = express.Router();
const {
  getBookings,
  getTodayBookings,
  getUpcomingBookings,
  getBookingById,
  createBooking,
  updateBooking,
  updateBookingStatus,
  deleteBooking
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getBookings);
router.get('/today', getTodayBookings);
router.get('/upcoming', getUpcomingBookings);
router.get('/:id', getBookingById);
router.post('/', createBooking);
router.put('/:id', updateBooking);
router.patch('/:id/status', updateBookingStatus);
router.delete('/:id', deleteBooking);

module.exports = router;
