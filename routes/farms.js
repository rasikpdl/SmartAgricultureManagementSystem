const express = require('express');
const router  = express.Router();
const db      = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM farms ORDER BY farm_id');
    res.render('farms', { rows: result.rows, error: null });
  } catch (err) {
    res.render('farms', { rows: [], error: err.message });
  }
});

router.post('/add', async (req, res) => {
  const { farm_name, owner_name, location, area_hectares } = req.body;
  try {
    await db.query(
      'INSERT INTO farms (farm_name, owner_name, location, area_hectares) VALUES ($1, $2, $3, $4)',
      [farm_name, owner_name, location, area_hectares]
    );
  } catch (err) { console.error(err.message); }
  res.redirect('/farms');
});

router.post('/delete', async (req, res) => {
  try {
    await db.query('DELETE FROM farms WHERE farm_id = $1', [req.body.farm_id]);
  } catch (err) { console.error(err.message); }
  res.redirect('/farms');
});

module.exports = router;
