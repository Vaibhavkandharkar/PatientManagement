// src/routes/patients.js
const router = require('express').Router();
const ctrl   = require('../controllers/patientController');
const auth   = require('../middleware/auth');

router.use(auth);                         // all patient routes are protected

router.get('/',       ctrl.getAll);       // GET  /api/patients?search=&filter=
router.get('/:id',    ctrl.getOne);       // GET  /api/patients/5
router.post('/',      ctrl.create);       // POST /api/patients
router.put('/:id',    ctrl.update);       // PUT  /api/patients/5
router.delete('/:id', ctrl.remove);       // DEL  /api/patients/5

module.exports = router;
