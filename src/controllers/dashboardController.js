// src/controllers/dashboardController.js
const db = require('../config/db');

/* ── GET /api/dashboard ── */
exports.getStats = async (req, res) => {
  try {
    const [[{ totalPatients }]]  = await db.query('SELECT COUNT(*) AS totalPatients FROM patients');
    const [[{ totalDoctors }]]   = await db.query('SELECT COUNT(*) AS totalDoctors FROM doctors WHERE is_active=1');
    const [[{ totalStaff }]]     = await db.query('SELECT COUNT(*) AS totalStaff FROM staff');
    const [[{ todayAppts }]]     = await db.query(
      'SELECT COUNT(*) AS todayAppts FROM appointments WHERE appointment_date = CURDATE()'
    );
    const [[{ emergencyCases }]] = await db.query(
      "SELECT COUNT(*) AS emergencyCases FROM patients WHERE status = 'Emergency'"
    );
    const [[{ totalRevenue }]]   = await db.query(
      "SELECT IFNULL(SUM(grand_total),0) AS totalRevenue FROM invoices WHERE status='Paid'"
    );
    const [[{ admittedToday }]]  = await db.query(
      'SELECT COUNT(*) AS admittedToday FROM patients WHERE DATE(created_at) = CURDATE()'
    );

    // Weekly patient visits (Mon–Sun)
    const [weeklyVisits] = await db.query(`
      SELECT DAYNAME(appointment_date) AS day, COUNT(*) AS count
      FROM appointments
      WHERE appointment_date >= CURDATE() - INTERVAL 6 DAY
      GROUP BY DAYNAME(appointment_date)
      ORDER BY appointment_date ASC
    `);

    // Weekly revenue
    const [weeklyRevenue] = await db.query(`
      SELECT DATE_FORMAT(invoice_date,'%a') AS day, IFNULL(SUM(grand_total),0) AS total
      FROM invoices
      WHERE invoice_date >= CURDATE() - INTERVAL 6 DAY AND status='Paid'
      GROUP BY invoice_date
      ORDER BY invoice_date ASC
    `);

    // Recent patients (last 5)
    const [recentPatients] = await db.query(`
      SELECT patient_id, name, age, disease, status, admission_date
      FROM patients ORDER BY id DESC LIMIT 5
    `);

    res.json({
      success: true,
      data: {
        totalPatients,
        totalDoctors,
        totalStaff,
        todayAppts,
        emergencyCases,
        totalRevenue,
        admittedToday,
        weeklyVisits,
        weeklyRevenue,
        recentPatients,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
