const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET /sales  — select Farm → Field, then show sales for harvests of crops in that field
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

    let sales = [];
    let harvests = [];
    if (selectedFieldId) {
      // Get all sales that belong to harvests of crops in this field
      const salesResult = await db.query(`
        SELECT s.*, h.harvest_date, h.harvest_id, c.crop_name
        FROM sales s
        JOIN harvests h ON s.harvest_id = h.harvest_id
        JOIN crops c ON h.crop_id = c.crop_id
        WHERE c.field_id = $1
        ORDER BY s.sale_id
      `, [selectedFieldId]);
      sales = salesResult.rows;

      // Get harvests for the "Add" form dropdown (only harvests from this field)
      const harvestsResult = await db.query(`
        SELECT h.harvest_id, h.harvest_date, c.crop_name
        FROM harvests h
        JOIN crops c ON h.crop_id = c.crop_id
        WHERE c.field_id = $1
        ORDER BY h.harvest_date DESC
      `, [selectedFieldId]);
      harvests = harvestsResult.rows;
    }

    res.render('sales', {
      farms,
      fields,
      rows: sales,
      harvests,
      selectedFarmId,
      selectedFieldId,
      error: null
    });
  } catch (err) {
    res.render('sales', {
      farms: [], fields: [], rows: [], harvests: [],
      selectedFarmId, selectedFieldId, error: err.message
    });
  }
});

// POST /sales/add
router.post('/add', async (req, res) => {
  const { farm_id, field_id, harvest_id, buyer_name, quantity_sold_kg, price_per_kg, sale_date } = req.body;
  try {
    await db.query(
      'INSERT INTO sales (harvest_id, buyer_name, quantity_sold_kg, price_per_kg, sale_date) VALUES ($1, $2, $3, $4, $5)',
      [harvest_id, buyer_name, quantity_sold_kg, price_per_kg, sale_date]
    );
  } catch (err) { console.error(err.message); }
  res.redirect(`/sales?farm_id=${farm_id}&field_id=${field_id}`);
});

// POST /sales/delete
router.post('/delete', async (req, res) => {
  const { sale_id, farm_id, field_id } = req.body;
  try {
    await db.query('DELETE FROM sales WHERE sale_id = $1', [sale_id]);
  } catch (err) { console.error(err.message); }
  res.redirect(`/sales?farm_id=${farm_id}&field_id=${field_id}`);
});

module.exports = router;
