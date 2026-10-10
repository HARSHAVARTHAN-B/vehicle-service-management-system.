const express = require('express');
const router = express.Router();
const {
  getMechanics,
  getAvailableMechanics,
  getMechanicById,
  createMechanic,
  updateMechanic,
  deleteMechanic
} = require('../controllers/mechanicController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getMechanics);
router.get('/available', getAvailableMechanics);
router.get('/:id', getMechanicById);
router.post('/', createMechanic);
router.put('/:id', updateMechanic);
router.delete('/:id', deleteMechanic);

module.exports = router;
