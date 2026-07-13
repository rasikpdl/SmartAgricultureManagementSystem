const express = require('express');
const router  = express.Router();
const db      = require('../db');

router.get('/', async (req, res) => {
  try {
    const fertilizersResult = await db.query(`
      SELECT fz.*, c.crop_name, c.variety 
      FROM fertilizers fz 
      JOIN crops c ON fz.crop_id = c.crop_id 
      ORDER BY fz.applied_date DESC, fz.fertilizer_id DESC
    `);
    const cropsResult = await db.query('SELECT crop_id, crop_name, variety FROM crops ORDER BY crop_name');
    res.render('fertilizers', { 
      rows: fertilizersResult.rows, 
      crops: cropsResult.rows, 
      error: null 
    });
  } catch (err) {
    res.render('fertilizers', { rows: [], crops: [], error: err.message });
  }
});

router.post('/add', async (req, res) => {
  const { crop_id, fertilizer_name, quantity_kg, applied_date } = req.body;
  try {
    await db.query(
      'INSERT INTO fertilizers (crop_id, fertilizer_name, quantity_kg, applied_date) VALUES ($1, $2, $3, $4)',
      [crop_id, fertilizer_name, quantity_kg || null, applied_date]
    );
  } catch (err) { 
    console.error(err.message); 
  }
  res.redirect('/fertilizers');
});

router.post('/delete', async (req, res) => {
  try {
    await db.query('DELETE FROM fertilizers WHERE fertilizer_id = $1', [req.body.fertilizer_id]);
  } catch (err) { 
    console.error(err.message); 
  }
  res.redirect('/fertilizers');
});

module.exports = router;
