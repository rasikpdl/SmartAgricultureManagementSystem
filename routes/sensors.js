const express = require('express');
const router  = express.Router();
const db      = require('../db');

router.get('/', async (req, res) => {
  try {
    const sensorsResult = await db.query(`
      SELECT s.*, f.field_name 
      FROM sensors s 
      JOIN fields f ON s.field_id = f.field_id 
      ORDER BY s.sensor_id
    `);
    const fieldsResult = await db.query('SELECT field_id, field_name FROM fields ORDER BY field_name');
    res.render('sensors', { 
      rows: sensorsResult.rows, 
      fields: fieldsResult.rows, 
      error: null 
    });
  } catch (err) {
    res.render('sensors', { rows: [], fields: [], error: err.message });
  }
});

router.post('/add', async (req, res) => {
  const { field_id, sensor_type, installed_date } = req.body;
  try {
    await db.query(
      'INSERT INTO sensors (field_id, sensor_type, installed_date) VALUES ($1, $2, $3)',
      [field_id, sensor_type, installed_date]
    );
  } catch (err) { 
    console.error(err.message); 
  }
  res.redirect('/sensors');
});

router.post('/delete', async (req, res) => {
  try {
    await db.query('DELETE FROM sensors WHERE sensor_id = $1', [req.body.sensor_id]);
  } catch (err) { 
    console.error(err.message); 
  }
  res.redirect('/sensors');
});

module.exports = router;
