// src/controllers/doctorController.js
const db = require('../config/db');

async function nextDoctorId() {
  const [rows] = await db.query('SELECT doctor_id FROM doctors ORDER BY id DESC LIMIT 1');
  if (!rows.length) return 'D001';
  const num = parseInt(rows[0].doctor_id.replace('D', ''), 10) + 1;
  return 'D' + String(num).padStart(3, '0');
}

/* ── GET /api/doctors ── */
exports.getAll = async (req, res) => {
  try {
    const { search } = req.query;
    let sql = 'SELECT * FROM doctors WHERE 1=1';
    const params = [];

    if (search) {
      sql += ' AND (name LIKE ? OR specialization LIKE ?)';
      const like = `%${search}%`;
      params.push(like, like);
    }
    sql += ' ORDER BY id DESC';
    const [rows] = await db.query(sql, params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── GET /api/doctors/:id ── */
exports.getOne = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM doctors WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Doctor not found.' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── POST /api/doctors ── */
exports.create = async (req, res) => {
  const { name, specialization, contact, available_days, joining_date } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Doctor name is required.' });

  try {
    const did = await nextDoctorId();
    const [result] = await db.query(
      `INSERT INTO doctors (doctor_id, name, specialization, contact, available_days, joining_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [did, name, specialization || null, contact || null,
       available_days || null, joining_date || null]
    );
    res.status(201).json({
      success: true,
      message: 'Doctor added.',
      data: { id: result.insertId, doctor_id: did },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── PUT /api/doctors/:id ── */
exports.update = async (req, res) => {
  const { name, specialization, contact, available_days, joining_date, is_active } = req.body;
  try {
    const [result] = await db.query(
      `UPDATE doctors SET name=?, specialization=?, contact=?, available_days=?,
       joining_date=?, is_active=? WHERE id=?`,
      [name, specialization, contact, available_days, joining_date,
       is_active !== undefined ? is_active : 1, req.params.id]
    );
    if (!result.affectedRows)
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    res.json({ success: true, message: 'Doctor updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── DELETE /api/doctors/:id ── */
exports.remove = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM doctors WHERE id = ?', [req.params.id]);
    if (!result.affectedRows)
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    res.json({ success: true, message: 'Doctor deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
