// src/controllers/prescriptionController.js
const db = require('../config/db');

/* ── GET /api/prescriptions?patient_id=X ── */
exports.getAll = async (req, res) => {
  try {
    const { patient_id } = req.query;
    let sql = `
      SELECT pr.*, p.name AS patient_name, d.name AS doctor_name
      FROM prescriptions pr
      LEFT JOIN patients p ON pr.patient_id = p.id
      LEFT JOIN doctors  d ON pr.doctor_id  = d.id
      WHERE 1=1
    `;
    const params = [];
    if (patient_id) { sql += ' AND pr.patient_id = ?'; params.push(patient_id); }
    sql += ' ORDER BY pr.id DESC';

    const [prescriptions] = await db.query(sql, params);

    // Attach medicines to each prescription
    for (const pres of prescriptions) {
      const [meds] = await db.query(
        'SELECT * FROM prescription_medicines WHERE prescription_id = ?',
        [pres.id]
      );
      pres.medicines = meds;
    }

    res.json({ success: true, count: prescriptions.length, data: prescriptions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── GET /api/prescriptions/:id ── */
exports.getOne = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT pr.*, p.name AS patient_name, d.name AS doctor_name
       FROM prescriptions pr
       LEFT JOIN patients p ON pr.patient_id = p.id
       LEFT JOIN doctors  d ON pr.doctor_id  = d.id
       WHERE pr.id = ?`,
      [req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ success: false, message: 'Prescription not found.' });

    const [meds] = await db.query(
      'SELECT * FROM prescription_medicines WHERE prescription_id = ?',
      [req.params.id]
    );
    rows[0].medicines = meds;
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── POST /api/prescriptions ── */
exports.create = async (req, res) => {
  const { patient_id, doctor_id, disease, notes, prescribed_on, medicines } = req.body;
  if (!patient_id)
    return res.status(400).json({ success: false, message: 'patient_id is required.' });
  if (!medicines || !medicines.length)
    return res.status(400).json({ success: false, message: 'At least one medicine is required.' });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      'INSERT INTO prescriptions (patient_id, doctor_id, disease, notes, prescribed_on) VALUES (?, ?, ?, ?, ?)',
      [patient_id, doctor_id || null, disease || null, notes || null, prescribed_on || null]
    );
    const prescriptionId = result.insertId;

    for (const med of medicines) {
      await conn.query(
        `INSERT INTO prescription_medicines
          (prescription_id, medicine_name, morning, afternoon, night, timing, duration_days)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [prescriptionId, med.medicine_name || med.name,
         med.morning || 0, med.afternoon || 0, med.night || 0,
         med.timing || 'After Food', med.duration_days || med.d || null]
      );
    }

    await conn.commit();
    res.status(201).json({
      success: true,
      message: 'Prescription saved.',
      data: { id: prescriptionId },
    });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
};

/* ── DELETE /api/prescriptions/:id ── */
exports.remove = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM prescriptions WHERE id = ?', [req.params.id]);
    if (!result.affectedRows)
      return res.status(404).json({ success: false, message: 'Prescription not found.' });
    res.json({ success: true, message: 'Prescription deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
