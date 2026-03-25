// src/controllers/patientController.js
const db = require('../config/db');

/* helper – generate next patient ID like P004 */
async function nextPatientId() {
  const [rows] = await db.query('SELECT patient_id FROM patients ORDER BY id DESC LIMIT 1');
  if (!rows.length) return 'P001';
  const num = parseInt(rows[0].patient_id.replace('P', ''), 10) + 1;
  return 'P' + String(num).padStart(3, '0');
}

/* ── GET /api/patients ── */
exports.getAll = async (req, res) => {
  try {
    const { search, filter } = req.query;
    let sql = `
      SELECT p.*, d.name AS doctor_name
      FROM patients p
      LEFT JOIN doctors d ON p.doctor_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ' AND (p.name LIKE ? OR p.patient_id LIKE ? OR p.disease LIKE ?)';
      const like = `%${search}%`;
      params.push(like, like, like);
    }
    if (filter === 'today') {
      sql += ' AND DATE(p.created_at) = CURDATE()';
    } else if (filter === 'this_week') {
      sql += ' AND YEARWEEK(p.created_at, 1) = YEARWEEK(CURDATE(), 1)';
    }

    sql += ' ORDER BY p.id DESC';
    const [rows] = await db.query(sql, params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── GET /api/patients/:id ── */
exports.getOne = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, d.name AS doctor_name
       FROM patients p
       LEFT JOIN doctors d ON p.doctor_id = d.id
       WHERE p.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Patient not found.' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── POST /api/patients ── */
exports.create = async (req, res) => {
  const {
    name, age, blood_group, contact, disease,
    address, admission_date, next_visit, doctor_id, status,
  } = req.body;

  if (!name) return res.status(400).json({ success: false, message: 'Patient name is required.' });

  try {
    const pid = await nextPatientId();
    const [result] = await db.query(
      `INSERT INTO patients
        (patient_id, name, age, blood_group, contact, disease, address, admission_date, next_visit, doctor_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [pid, name, age || null, blood_group || null, contact || null,
       disease || null, address || null,
       admission_date || null, next_visit || null,
       doctor_id || null, status || 'Admitted']
    );
    res.status(201).json({
      success: true,
      message: 'Patient added successfully.',
      data: { id: result.insertId, patient_id: pid },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── PUT /api/patients/:id ── */
exports.update = async (req, res) => {
  const {
    name, age, blood_group, contact, disease,
    address, admission_date, next_visit, doctor_id, status,
  } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE patients SET
        name=?, age=?, blood_group=?, contact=?, disease=?,
        address=?, admission_date=?, next_visit=?, doctor_id=?, status=?
       WHERE id=?`,
      [name, age, blood_group, contact, disease,
       address, admission_date, next_visit, doctor_id, status,
       req.params.id]
    );
    if (!result.affectedRows)
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    res.json({ success: true, message: 'Patient updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── DELETE /api/patients/:id ── */
exports.remove = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM patients WHERE id = ?', [req.params.id]);
    if (!result.affectedRows)
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    res.json({ success: true, message: 'Patient deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
