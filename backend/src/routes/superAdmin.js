const express = require('express');
const router = express.Router();
const { getStats, getAllUsers, updateUser } = require('../controllers/superAdminController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/stats', authenticate, authorize('SUPER_ADMIN'), getStats);
router.get('/users', authenticate, authorize('SUPER_ADMIN'), getAllUsers);
router.put('/users/:id', authenticate, authorize('SUPER_ADMIN'), updateUser);

module.exports = router;
