// src/controllers/billingController.js
const db = require('../config/db');

/* ── GET /api/billing ── */
exports.getAll = async (req, res) => {
  try {
    const { patient_id } = req.query;
    let sql = 'SELECT * FROM invoices WHERE 1=1';
    const params = [];
    if (patient_id) { sql += ' AND patient_id = ?'; params.push(patient_id); }
    sql += ' ORDER BY id DESC';

    const [invoices] = await db.query(sql, params);

    for (const inv of invoices) {
      const [items] = await db.query(
        'SELECT * FROM invoice_items WHERE invoice_id = ?',
        [inv.id]
      );
      inv.items = items;
    }

    res.json({ success: true, count: invoices.length, data: invoices });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── GET /api/billing/:id ── */
exports.getOne = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM invoices WHERE id = ?', [req.params.id]);
    if (!rows.length)
      return res.status(404).json({ success: false, message: 'Invoice not found.' });

    const [items] = await db.query(
      'SELECT * FROM invoice_items WHERE invoice_id = ?', [req.params.id]
    );
    rows[0].items = items;
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── POST /api/billing ── */
exports.create = async (req, res) => {
  const { patient_id, patient_name, contact, items, invoice_date } = req.body;

  if (!patient_name)
    return res.status(400).json({ success: false, message: 'Patient name is required.' });
  if (!items || !items.length)
    return res.status(400).json({ success: false, message: 'At least one billing item is required.' });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const invoiceNo = 'INV-' + Date.now();
    const grandTotal = items.reduce((sum, item) => sum + (parseFloat(item.total_price) || 0), 0);

    const [result] = await conn.query(
      `INSERT INTO invoices (invoice_no, patient_id, patient_name, contact, grand_total, invoice_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [invoiceNo, patient_id || null, patient_name, contact || null,
       grandTotal, invoice_date || null]
    );
    const invoiceId = result.insertId;

    for (const item of items) {
      await conn.query(
        `INSERT INTO invoice_items (invoice_id, item_type, item_name, quantity, unit_price, total_price)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [invoiceId, item.item_type || 'service', item.item_name || item.name,
         item.quantity || 1, item.unit_price || item.price || 0,
         item.total_price || item.total || 0]
      );
    }

    await conn.commit();
    res.status(201).json({
      success: true,
      message: 'Invoice generated.',
      data: { id: invoiceId, invoice_no: invoiceNo, grand_total: grandTotal },
    });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
};

/* ── PATCH /api/billing/:id/status ── */
exports.updateStatus = async (req, res) => {
  const { status } = req.body;
  if (!['Pending', 'Paid', 'Cancelled'].includes(status))
    return res.status(400).json({ success: false, message: 'Invalid status.' });

  try {
    const [result] = await db.query(
      'UPDATE invoices SET status = ? WHERE id = ?', [status, req.params.id]
    );
    if (!result.affectedRows)
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    res.json({ success: true, message: 'Invoice status updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── DELETE /api/billing/:id ── */
exports.remove = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM invoices WHERE id = ?', [req.params.id]);
    if (!result.affectedRows)
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    res.json({ success: true, message: 'Invoice deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
