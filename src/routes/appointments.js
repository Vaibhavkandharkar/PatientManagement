// src/routes/appointments.js
const router = require('express').Router();
const ctrl   = require('../controllers/appointmentController');
const auth   = require('../middleware/auth');

router.use(auth);

router.get('/',       ctrl.getAll);   // GET  /api/appointments?filter=today
router.get('/:id',    ctrl.getOne);   // GET  /api/appointments/3
router.post('/',      ctrl.create);   // POST /api/appointments
router.put('/:id',    ctrl.update);   // PUT  /api/appointments/3
router.delete('/:id', ctrl.remove);   // DEL  /api/appointments/3

module.exports = router;
