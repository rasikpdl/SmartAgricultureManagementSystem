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
    let harvests = [];
    if (selectedFieldId) {
      const cropsResult = await db.query('SELECT crop_id, crop_name FROM crops WHERE field_id = $1 ORDER BY crop_name', [selectedFieldId]);
      crops = cropsResult.rows;

      const harvestsResult = await db.query(`
        SELECT h.*, c.crop_name 
        FROM harvests h 
        JOIN crops c ON h.crop_id = c.crop_id 
        WHERE c.field_id = $1
        ORDER BY h.harvest_id
      `, [selectedFieldId]);
      harvests = harvestsResult.rows;
    }

    res.render('harvests', { 
      farms, 
      fields, 
      crops,
      rows: harvests, 
      selectedFarmId, 
      selectedFieldId,
      error: null 
    });
  } catch (err) {
    res.render('harvests', { farms: [], fields: [], crops: [], rows: [], selectedFarmId, selectedFieldId, error: err.message });
  }
});

router.post('/add', async (req, res) => {
  const { farm_id, field_id, crop_id, harvest_date, quantity_kg, quality_grade } = req.body;
  try {
    await db.query(
      'INSERT INTO harvests (crop_id, harvest_date, quantity_kg, quality_grade) VALUES ($1, $2, $3, $4)',
      [crop_id, harvest_date, quantity_kg, quality_grade]
    );
  } catch (err) { console.error(err.message); }
  res.redirect(`/harvests?farm_id=${farm_id}&field_id=${field_id}`);
});

router.post('/delete', async (req, res) => {
  const { harvest_id, farm_id, field_id } = req.body;
  try {
    await db.query('DELETE FROM harvests WHERE harvest_id = $1', [harvest_id]);
  } catch (err) { console.error(err.message); }
  res.redirect(`/harvests?farm_id=${farm_id}&field_id=${field_id}`);
});

module.exports = router;
