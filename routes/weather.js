const express = require('express');
const router  = express.Router();
const db      = require('../db');

router.get('/', async (req, res) => {
  try {
    const weatherResult = await db.query(`
      SELECT w.*, f.field_name 
      FROM weather w 
      JOIN fields f ON w.field_id = f.field_id 
      ORDER BY w.record_date DESC, w.weather_id DESC
    `);
    const fieldsResult = await db.query('SELECT field_id, field_name FROM fields ORDER BY field_name');
    res.render('weather', { 
      rows: weatherResult.rows, 
      fields: fieldsResult.rows, 
      error: null 
    });
  } catch (err) {
    res.render('weather', { rows: [], fields: [], error: err.message });
  }
});

router.post('/add', async (req, res) => {
  const { field_id, record_date, temperature, rainfall_mm, humidity } = req.body;
  try {
    await db.query(
      'INSERT INTO weather (field_id, record_date, temperature, rainfall_mm, humidity) VALUES ($1, $2, $3, $4, $5)',
      [field_id, record_date, temperature || null, rainfall_mm || null, humidity || null]
    );
  } catch (err) { 
    console.error(err.message); 
  }
  res.redirect('/weather');
});

router.post('/delete', async (req, res) => {
  try {
    await db.query('DELETE FROM weather WHERE weather_id = $1', [req.body.weather_id]);
  } catch (err) { 
    console.error(err.message); 
  }
  res.redirect('/weather');
});

module.exports = router;
