const express = require('express');
const router = express.Router();
const { getAllServices, createService, updateService, deleteService } = require('../controllers/serviceController');
const { authenticate, authorize, businessScope } = require('../middleware/auth');

router.get('/',      authenticate, authorize('ADMIN'), businessScope, getAllServices);
router.post('/',     authenticate, authorize('ADMIN'), businessScope, createService);
router.put('/:id',   authenticate, authorize('ADMIN'), businessScope, updateService);
router.delete('/:id',authenticate, authorize('ADMIN'), businessScope, deleteService);

module.exports = router;
