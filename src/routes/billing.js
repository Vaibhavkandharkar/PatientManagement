// src/routes/billing.js
const router = require('express').Router();
const ctrl   = require('../controllers/billingController');
const auth   = require('../middleware/auth');

router.use(auth);

router.get('/',              ctrl.getAll);         // GET  /api/billing?patient_id=2
router.get('/:id',           ctrl.getOne);         // GET  /api/billing/1
router.post('/',             ctrl.create);         // POST /api/billing
router.patch('/:id/status',  ctrl.updateStatus);   // PATCH /api/billing/1/status
router.delete('/:id',        ctrl.remove);         // DEL  /api/billing/1

module.exports = router;
