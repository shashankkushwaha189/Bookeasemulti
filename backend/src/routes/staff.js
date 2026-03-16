const express = require('express');
const router = express.Router();
const { getAllStaff, createStaff, updateStaff, deleteStaff } = require('../controllers/staffController');
const { getStaffAppointments } = require('../controllers/appointmentController');
const { authenticate, authorize, businessScope } = require('../middleware/auth');

router.get('/my-appointments', authenticate, authorize('STAFF'), getStaffAppointments);
router.get('/',      authenticate, authorize('ADMIN'), businessScope, getAllStaff);
router.post('/',     authenticate, authorize('ADMIN'), businessScope, createStaff);
router.put('/:id',   authenticate, authorize('ADMIN'), businessScope, updateStaff);
router.delete('/:id',authenticate, authorize('ADMIN'), businessScope, deleteStaff);

module.exports = router;
