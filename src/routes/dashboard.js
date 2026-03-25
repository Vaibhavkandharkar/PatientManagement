// src/routes/dashboard.js
const router = require('express').Router();
const ctrl   = require('../controllers/dashboardController');
const auth   = require('../middleware/auth');

router.get('/', auth, ctrl.getStats);   // GET /api/dashboard

module.exports = router;
