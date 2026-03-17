const express = require('express');
const router = express.Router();
const { getBusinessAppointments, getMyAppointments, createAppointment, updateAppointment, getAllAppointments, getAvailableSlots } = require('../controllers/appointmentController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/all',      authenticate, authorize('SUPER_ADMIN'), getAllAppointments);
router.get('/business', authenticate, authorize('ADMIN'),       getBusinessAppointments);
router.get('/my',       authenticate, authorize('CUSTOMER'),    getMyAppointments);
router.get('/available-slots', getAvailableSlots);
router.post('/',        authenticate, authorize('CUSTOMER'),    createAppointment);
router.put('/:id',      authenticate, updateAppointment);

module.exports = router;
