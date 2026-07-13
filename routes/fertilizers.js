const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET /fertilizers  — select Farm → Field → Crop, then show fertilizers for that crop
router.get('/', async (req, res) => {
  const selectedFarmId  = req.query.farm_id;
  const selectedFieldId = req.query.field_id;
  const selectedCropId  = req.query.crop_id;

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

    let crops = [];
    if (selectedFieldId) {
      const cropsResult = await db.query(
        'SELECT * FROM crops WHERE field_id = $1 ORDER BY crop_id',
        [selectedFieldId]
      );
      crops = cropsResult.rows;
    }

    let fertilizers = [];
    if (selectedCropId) {
      const fertResult = await db.query(
        'SELECT * FROM fertilizers WHERE crop_id = $1 ORDER BY fertilizer_id',
        [selectedCropId]
      );
      fertilizers = fertResult.rows;
    }

    res.render('fertilizers', {
      farms,
      fields,
      crops,
      fertilizers,
      selectedFarmId,
      selectedFieldId,
      selectedCropId,
      error: null
    });
  } catch (err) {
    res.render('fertilizers', {
      farms: [], fields: [], crops: [], fertilizers: [],
      selectedFarmId, selectedFieldId, selectedCropId, error: err.message
    });
  }
});

// POST /fertilizers/add
router.post('/add', async (req, res) => {
  const { farm_id, field_id, crop_id, fertilizer_name, quantity_kg, applied_date } = req.body;
  try {
    await db.query(
      'INSERT INTO fertilizers (crop_id, fertilizer_name, quantity_kg, applied_date) VALUES ($1, $2, $3, $4)',
      [crop_id, fertilizer_name, quantity_kg || null, applied_date || null]
    );
  } catch (err) { console.error(err.message); }
  res.redirect(`/fertilizers?farm_id=${farm_id}&field_id=${field_id}&crop_id=${crop_id}`);
});

// POST /fertilizers/delete
router.post('/delete', async (req, res) => {
  const { fertilizer_id, farm_id, field_id, crop_id } = req.body;
  try {
    await db.query('DELETE FROM fertilizers WHERE fertilizer_id = $1', [fertilizer_id]);
  } catch (err) { console.error(err.message); }
  res.redirect(`/fertilizers?farm_id=${farm_id}&field_id=${field_id}&crop_id=${crop_id}`);
});

module.exports = router;
