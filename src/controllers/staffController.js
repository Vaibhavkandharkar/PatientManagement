// src/controllers/staffController.js
const db = require('../config/db');

async function nextStaffId() {
  const [rows] = await db.query('SELECT staff_id FROM staff ORDER BY id DESC LIMIT 1');
  if (!rows.length) return 'S001';
  const num = parseInt(rows[0].staff_id.replace('S', ''), 10) + 1;
  return 'S' + String(num).padStart(3, '0');
}

/* ── GET /api/staff ── */
exports.getAll = async (req, res) => {
  try {
    const { search } = req.query;
    let sql = 'SELECT * FROM staff WHERE 1=1';
    const params = [];
    if (search) {
      sql += ' AND (name LIKE ? OR role LIKE ? OR department LIKE ?)';
      const like = `%${search}%`;
      params.push(like, like, like);
    }
    sql += ' ORDER BY id DESC';
    const [rows] = await db.query(sql, params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── GET /api/staff/:id ── */
exports.getOne = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM staff WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Staff not found.' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── POST /api/staff ── */
exports.create = async (req, res) => {
  const { name, role, department, contact, shift, salary, joining_date, status } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Staff name is required.' });

  try {
    const sid = await nextStaffId();
    const [result] = await db.query(
      `INSERT INTO staff (staff_id, name, role, department, contact, shift, salary, joining_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [sid, name, role || null, department || null, contact || null,
       shift || null, salary || null, joining_date || null, status || 'On Duty']
    );
    res.status(201).json({
      success: true,
      message: 'Staff member added.',
      data: { id: result.insertId, staff_id: sid },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── PUT /api/staff/:id ── */
exports.update = async (req, res) => {
  const { name, role, department, contact, shift, salary, joining_date, status } = req.body;
  try {
    const [result] = await db.query(
      `UPDATE staff SET name=?, role=?, department=?, contact=?,
       shift=?, salary=?, joining_date=?, status=? WHERE id=?`,
      [name, role, department, contact, shift, salary, joining_date, status, req.params.id]
    );
    if (!result.affectedRows)
      return res.status(404).json({ success: false, message: 'Staff not found.' });
    res.json({ success: true, message: 'Staff updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── DELETE /api/staff/:id ── */
exports.remove = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM staff WHERE id = ?', [req.params.id]);
    if (!result.affectedRows)
      return res.status(404).json({ success: false, message: 'Staff not found.' });
    res.json({ success: true, message: 'Staff deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
