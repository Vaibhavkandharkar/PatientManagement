// server.js  —  MediCore HMS · Node.js + Express + MySQL
require('dotenv').config();

const express = require('express');
const cors    = require('cors');

const app = express();

// ── Middleware ──────────────────────────────────────────
app.use(cors({
  origin: 'https://patientmanagement-blue.vercel.app',// change to your frontend URL in production
  methods: ['GET','POST','PUT','PATCH','DELETE'],
  allowedHeaders: ['Content-Type','Authorization'],
}));
app.use(express.json());  
app.use(express.urlencoded({ extended: true }));

// ── Routes ──────────────────────────────────────────────
app.use('/api/auth',          require('./src/routes/auth'));
app.use('/api/dashboard',     require('./src/routes/dashboard'));
app.use('/api/patients',      require('./src/routes/patients'));
app.use('/api/doctors',       require('./src/routes/doctors'));
app.use('/api/staff',         require('./src/routes/staff'));
app.use('/api/appointments',  require('./src/routes/appointments'));
app.use('/api/prescriptions', require('./src/routes/prescriptions'));
app.use('/api/billing',       require('./src/routes/billing'));

// ── Health check ────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🏥 MediCore HMS API is running',
    version: '1.0.0',
    endpoints: [
      'POST   /api/auth/login',
      'POST   /api/auth/register',
      'GET    /api/auth/me',
      'GET    /api/dashboard',
      'GET    /api/patients',
      'POST   /api/patients',
      'PUT    /api/patients/:id',
      'DELETE /api/patients/:id',
      'GET    /api/doctors',
      'POST   /api/doctors',
      'PUT    /api/doctors/:id',
      'DELETE /api/doctors/:id',
      'GET    /api/staff',
      'POST   /api/staff',
      'PUT    /api/staff/:id',
      'DELETE /api/staff/:id',
      'GET    /api/appointments',
      'POST   /api/appointments',
      'PUT    /api/appointments/:id',
      'DELETE /api/appointments/:id',
      'GET    /api/prescriptions',
      'POST   /api/prescriptions',
      'DELETE /api/prescriptions/:id',
      'GET    /api/billing',
      'POST   /api/billing',
      'PATCH  /api/billing/:id/status',
      'DELETE /api/billing/:id',
    ],
  });
});

// ── 404 handler ─────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found.` });
});

// ── Global error handler ────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

// ── Start server ────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀  MediCore HMS API running on http://localhost:${PORT}`);
  console.log(`📋  Health check: http://localhost:${PORT}/`);
  console.log(`🔐  Auth: http://localhost:${PORT}/api/auth/login\n`);
});
