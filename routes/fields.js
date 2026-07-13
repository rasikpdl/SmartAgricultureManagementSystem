const express = require('express');
const router  = express.Router();
const db      = require('../db');

router.get('/', async (req, res) => {
  const selectedFarmId = req.query.farm_id;
  try {
    const farmsResult = await db.query('SELECT * FROM farms ORDER BY farm_id');
    const farms = farmsResult.rows;

    let fields = [];
    if (selectedFarmId) {
      const fieldsResult = await db.query('SELECT * FROM fields WHERE farm_id = $1 ORDER BY field_id', [selectedFarmId]);
      fields = fieldsResult.rows;
    }

    res.render('fields', { 
      farms, 
      fields, 
      selectedFarmId, 
      error: null 
    });
  } catch (err) {
    res.render('fields', { farms: [], fields: [], selectedFarmId, error: err.message });
  }
});

router.post('/add', async (req, res) => {
  const { farm_id, field_name, area_hectares, soil_type } = req.body;
  try {
    await db.query(
      'INSERT INTO fields (farm_id, field_name, area_hectares, soil_type) VALUES ($1, $2, $3, $4)',
      [farm_id, field_name, area_hectares, soil_type]
    );
  } catch (err) { console.error(err.message); }
  res.redirect(`/fields?farm_id=${farm_id}`);
});

router.post('/delete', async (req, res) => {
  const { field_id, farm_id } = req.body;
  try {
    await db.query('DELETE FROM fields WHERE field_id = $1', [field_id]);
  } catch (err) { console.error(err.message); }
  res.redirect(`/fields?farm_id=${farm_id}`);
});

module.exports = router;
