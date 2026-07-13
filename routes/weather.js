const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET /weather  — select Farm then Field, then show weather records for that field
router.get('/', async (req, res) => {
  const selectedFarmId  = req.query.farm_id;
  const selectedFieldId = req.query.field_id;

  try {
    const farmsResult = await db.query('SELECT * FROM farms ORDER BY farm_id');
    const farms = farmsResult.rows;

    let fields = [];
    if (selectedFarmId) {
      const fieldsResult = await db.query(
        'SELECT * FROM fields WHERE farm_id = $1 ORDER BY field_id',
        [selectedFarmId]
      );
      fields = fieldsResult.rows;
    }

    let weatherRecords = [];
    if (selectedFieldId) {
      const weatherResult = await db.query(
        'SELECT * FROM weather WHERE field_id = $1 ORDER BY record_date DESC',
        [selectedFieldId]
      );
      weatherRecords = weatherResult.rows;
    }

    res.render('weather', {
      farms,
      fields,
      weatherRecords,
      selectedFarmId,
      selectedFieldId,
      error: null
    });
  } catch (err) {
    res.render('weather', {
      farms: [], fields: [], weatherRecords: [],
      selectedFarmId, selectedFieldId, error: err.message
    });
  }
});

// POST /weather/add
router.post('/add', async (req, res) => {
  const { farm_id, field_id, record_date, temperature, rainfall_mm, humidity } = req.body;
  try {
    await db.query(
      'INSERT INTO weather (field_id, record_date, temperature, rainfall_mm, humidity) VALUES ($1, $2, $3, $4, $5)',
      [field_id, record_date || null, temperature || null, rainfall_mm || null, humidity || null]
    );
  } catch (err) { console.error(err.message); }
  res.redirect(`/weather?farm_id=${farm_id}&field_id=${field_id}`);
});

// POST /weather/delete
router.post('/delete', async (req, res) => {
  const { weather_id, farm_id, field_id } = req.body;
  try {
    await db.query('DELETE FROM weather WHERE weather_id = $1', [weather_id]);
  } catch (err) { console.error(err.message); }
  res.redirect(`/weather?farm_id=${farm_id}&field_id=${field_id}`);
});

module.exports = router;
