const express = require('express');
const router  = express.Router();
const db      = require('../db');

router.get('/', async (req, res) => {
  try {
    const cropsResult = await db.query('SELECT crop_id, crop_name FROM crops ORDER BY crop_name');
    const crops = cropsResult.rows;

    const result = await db.query(`
      SELECT d.*, c.crop_name 
      FROM diseases d 
      LEFT JOIN crops c ON d.crop_id = c.crop_id 
      ORDER BY d.disease_id
    `);
    res.render('diseases', { rows: result.rows, crops: crops, error: null });
  } catch (err) {
    res.render('diseases', { rows: [], crops: [], error: err.message });
  }
});

router.post('/add', async (req, res) => {
  const { crop_id, disease_name, detected_date, severity, treatment_notes } = req.body;
  try {
    await db.query(
      'INSERT INTO diseases (crop_id, disease_name, detected_date, severity, treatment_notes) VALUES ($1, $2, $3, $4, $5)',
      [crop_id, disease_name, detected_date, severity, treatment_notes]
    );
  } catch (err) { console.error(err.message); }
  res.redirect('/diseases');
});

router.post('/delete', async (req, res) => {
  try {
    await db.query('DELETE FROM diseases WHERE disease_id = $1', [req.body.disease_id]);
  } catch (err) { console.error(err.message); }
  res.redirect('/diseases');
});

module.exports = router;
