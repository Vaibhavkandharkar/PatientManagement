// src/routes/prescriptions.js
const router = require('express').Router();
const ctrl   = require('../controllers/prescriptionController');
const auth   = require('../middleware/auth');

router.use(auth);

router.get('/',       ctrl.getAll);   // GET  /api/prescriptions?patient_id=2
router.get('/:id',    ctrl.getOne);   // GET  /api/prescriptions/1
router.post('/',      ctrl.create);   // POST /api/prescriptions
router.delete('/:id', ctrl.remove);   // DEL  /api/prescriptions/1

module.exports = router;
