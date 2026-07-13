const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET /sensors  — select Farm then Field, then show sensors for that field
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

    let sensors = [];
    if (selectedFieldId) {
      const sensorsResult = await db.query(
        'SELECT * FROM sensors WHERE field_id = $1 ORDER BY sensor_id',
        [selectedFieldId]
      );
      sensors = sensorsResult.rows;
    }

    res.render('sensors', {
      farms,
      fields,
      sensors,
      selectedFarmId,
      selectedFieldId,
      error: null
    });
  } catch (err) {
    res.render('sensors', {
      farms: [], fields: [], sensors: [],
      selectedFarmId, selectedFieldId, error: err.message
    });
  }
});

// POST /sensors/add
router.post('/add', async (req, res) => {
  const { farm_id, field_id, sensor_type, installed_date } = req.body;
  try {
    await db.query(
      'INSERT INTO sensors (field_id, sensor_type, installed_date) VALUES ($1, $2, $3)',
      [field_id, sensor_type, installed_date || null]
    );
  } catch (err) { console.error(err.message); }
  res.redirect(`/sensors?farm_id=${farm_id}&field_id=${field_id}`);
});

// POST /sensors/delete
router.post('/delete', async (req, res) => {
  const { sensor_id, farm_id, field_id } = req.body;
  try {
    await db.query('DELETE FROM sensors WHERE sensor_id = $1', [sensor_id]);
  } catch (err) { console.error(err.message); }
  res.redirect(`/sensors?farm_id=${farm_id}&field_id=${field_id}`);
});

module.exports = router;