const express = require('express');
const router  = express.Router();
const db      = require('../db');

router.get('/', async (req, res) => {
  try {
    const cropsResult = await db.query('SELECT crop_id, crop_name FROM crops ORDER BY crop_name');
    const crops = cropsResult.rows;

    const result = await db.query(`
      SELECT h.*, c.crop_name 
      FROM harvests h 
      LEFT JOIN crops c ON h.crop_id = c.crop_id 
      ORDER BY h.harvest_id
    `);
    res.render('harvests', { rows: result.rows, crops: crops, error: null });
  } catch (err) {
    res.render('harvests', { rows: [], crops: [], error: err.message });
  }
});

router.post('/add', async (req, res) => {
  const { crop_id, harvest_date, quantity_kg, quality_grade } = req.body;
  try {
    await db.query(
      'INSERT INTO harvests (crop_id, harvest_date, quantity_kg, quality_grade) VALUES ($1, $2, $3, $4)',
      [crop_id, harvest_date, quantity_kg, quality_grade]
    );
  } catch (err) { console.error(err.message); }
  res.redirect('/harvests');
});

router.post('/delete', async (req, res) => {
  try {
    await db.query('DELETE FROM harvests WHERE harvest_id = $1', [req.body.harvest_id]);
  } catch (err) { console.error(err.message); }
  res.redirect('/harvests');
});

module.exports = router;
