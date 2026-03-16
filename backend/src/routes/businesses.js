const express = require('express');
const router = express.Router();
const { getAllBusinesses, getBusinessById, getBusinessServices, getBusinessStaff, getAllBusinessesAdmin, createBusiness, updateBusiness, deleteBusiness } = require('../controllers/businessController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/',           authenticate, getAllBusinesses);
router.get('/admin/all',  authenticate, authorize('SUPER_ADMIN'), getAllBusinessesAdmin);
router.get('/:id',        authenticate, getBusinessById);
router.get('/:id/services', authenticate, getBusinessServices);
router.get('/:id/staff',    authenticate, getBusinessStaff);
router.post('/',          authenticate, authorize('SUPER_ADMIN'), createBusiness);
router.put('/:id',        authenticate, authorize('SUPER_ADMIN'), updateBusiness);
router.delete('/:id',     authenticate, authorize('SUPER_ADMIN'), deleteBusiness);

module.exports = router;
