const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET /diseases  — select Farm → Field → Crop, then show diseases for that crop
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

    let diseases = [];
    if (selectedCropId) {
      const disResult = await db.query(
        'SELECT * FROM diseases WHERE crop_id = $1 ORDER BY disease_id',
        [selectedCropId]
      );
      diseases = disResult.rows;
    }

    res.render('diseases', {
      farms,
      fields,
      crops,
      rows: diseases, // to match EJS variable name
      selectedFarmId,
      selectedFieldId,
      selectedCropId,
      error: null
    });
  } catch (err) {
    res.render('diseases', {
      farms: [], fields: [], crops: [], rows: [],
      selectedFarmId, selectedFieldId, selectedCropId, error: err.message
    });
  }
});

// POST /diseases/add
router.post('/add', async (req, res) => {
  const { farm_id, field_id, crop_id, disease_name, detected_date, severity, treatment_notes } = req.body;
  try {
    await db.query(
      'INSERT INTO diseases (crop_id, disease_name, detected_date, severity, treatment_notes) VALUES ($1, $2, $3, $4, $5)',
      [crop_id, disease_name, detected_date || null, severity, treatment_notes]
    );
  } catch (err) { console.error(err.message); }
  res.redirect(`/diseases?farm_id=${farm_id}&field_id=${field_id}&crop_id=${crop_id}`);
});

// POST /diseases/delete
router.post('/delete', async (req, res) => {
  const { disease_id, farm_id, field_id, crop_id } = req.body;
  try {
    await db.query('DELETE FROM diseases WHERE disease_id = $1', [disease_id]);
  } catch (err) { console.error(err.message); }
  res.redirect(`/diseases?farm_id=${farm_id}&field_id=${field_id}&crop_id=${crop_id}`);
});

module.exports = router;
