// src/controllers/appointmentController.js
const db = require('../config/db');

async function nextAppointmentId() {
  const [rows] = await db.query('SELECT appointment_id FROM appointments ORDER BY id DESC LIMIT 1');
  if (!rows.length) return 'A001';
  const num = parseInt(rows[0].appointment_id.replace('A', ''), 10) + 1;
  return 'A' + String(num).padStart(3, '0');
}

/* ── GET /api/appointments ── */
exports.getAll = async (req, res) => {
  try {
    const { filter } = req.query;
    let sql = `
      SELECT a.*, p.name AS patient_full_name, d.name AS doctor_full_name
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      LEFT JOIN doctors d  ON a.doctor_id  = d.id
      WHERE 1=1
    `;
    const params = [];

    if (filter === 'today') {
      sql += ' AND a.appointment_date = CURDATE()';
    } else if (filter === 'yesterday') {
      sql += ' AND a.appointment_date = CURDATE() - INTERVAL 1 DAY';
    } else if (filter === 'next_day') {
      sql += ' AND a.appointment_date = CURDATE() + INTERVAL 1 DAY';
    } else if (filter === 'this_week') {
      sql += ' AND YEARWEEK(a.appointment_date, 1) = YEARWEEK(CURDATE(), 1)';
    }

    sql += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';
    const [rows] = await db.query(sql, params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── GET /api/appointments/:id ── */
exports.getOne = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT a.*, p.name AS patient_full_name, d.name AS doctor_full_name
       FROM appointments a
       LEFT JOIN patients p ON a.patient_id = p.id
       LEFT JOIN doctors d  ON a.doctor_id  = d.id
       WHERE a.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Appointment not found.' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── POST /api/appointments ── */
exports.create = async (req, res) => {
  const {
    patient_id, doctor_id, patient_name, doctor_name,
    department, appointment_date, appointment_time, notes, status,
  } = req.body;

  if (!appointment_date)
    return res.status(400).json({ success: false, message: 'Appointment date is required.' });

  try {
    const aid = await nextAppointmentId();
    const [result] = await db.query(
      `INSERT INTO appointments
        (appointment_id, patient_id, doctor_id, patient_name, doctor_name,
         department, appointment_date, appointment_time, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [aid, patient_id || null, doctor_id || null,
       patient_name || null, doctor_name || null,
       department || null, appointment_date,
       appointment_time || null, notes || null, status || 'Confirmed']
    );
    res.status(201).json({
      success: true,
      message: 'Appointment booked.',
      data: { id: result.insertId, appointment_id: aid },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── PUT /api/appointments/:id ── */
exports.update = async (req, res) => {
  const {
    patient_name, doctor_name, department,
    appointment_date, appointment_time, notes, status,
  } = req.body;
  try {
    const [result] = await db.query(
      `UPDATE appointments SET
        patient_name=?, doctor_name=?, department=?,
        appointment_date=?, appointment_time=?, notes=?, status=?
       WHERE id=?`,
      [patient_name, doctor_name, department,
       appointment_date, appointment_time, notes, status, req.params.id]
    );
    if (!result.affectedRows)
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    res.json({ success: true, message: 'Appointment updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── DELETE /api/appointments/:id ── */
exports.remove = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM appointments WHERE id = ?', [req.params.id]);
    if (!result.affectedRows)
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    res.json({ success: true, message: 'Appointment deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
