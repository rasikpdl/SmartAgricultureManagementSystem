const express = require('express');
const router  = express.Router();
const db      = require('../db');

router.get('/', async (req, res) => {
  const selectedFarmId = req.query.farm_id;
  const selectedFieldId = req.query.field_id;
  
  try {
    const farmsResult = await db.query('SELECT * FROM farms ORDER BY farm_id');
    const farms = farmsResult.rows;

    let fields = [];
    if (selectedFarmId) {
      const fieldsResult = await db.query('SELECT * FROM fields WHERE farm_id = $1 ORDER BY field_id', [selectedFarmId]);
      fields = fieldsResult.rows;
    }

    let crops = [];
    if (selectedFieldId) {
      const cropsResult = await db.query('SELECT * FROM crops WHERE field_id = $1 ORDER BY crop_id', [selectedFieldId]);
      crops = cropsResult.rows;
    }

    res.render('crops', { 
      farms, 
      fields, 
      crops,
      selectedFarmId, 
      selectedFieldId,
      error: null 
    });
  } catch (err) {
    res.render('crops', { farms: [], fields: [], crops: [], selectedFarmId, selectedFieldId, error: err.message });
  }
});

router.post('/add', async (req, res) => {
  const { farm_id, field_id, crop_name, variety, planting_date, expected_harvest_date, status } = req.body;
  try {
    await db.query(
      'INSERT INTO crops (field_id, crop_name, variety, planting_date, expected_harvest_date, status) VALUES ($1, $2, $3, $4, $5, $6)',
      [field_id, crop_name, variety, planting_date || null, expected_harvest_date || null, status || 'growing']
    );
  } catch (err) { console.error(err.message); }
  res.redirect(`/crops?farm_id=${farm_id}&field_id=${field_id}`);
});

router.post('/delete', async (req, res) => {
  const { crop_id, farm_id, field_id } = req.body;
  try {
    await db.query('DELETE FROM crops WHERE crop_id = $1', [crop_id]);
  } catch (err) { console.error(err.message); }
  res.redirect(`/crops?farm_id=${farm_id}&field_id=${field_id}`);
});

module.exports = router;
