const express = require('express');
const router  = express.Router();
const db      = require('../db');

router.get('/', async (req, res) => {
  try {
    const harvestsResult = await db.query(`
      SELECT h.harvest_id, h.harvest_date, c.crop_name 
      FROM harvests h 
      JOIN crops c ON h.crop_id = c.crop_id 
      ORDER BY h.harvest_date DESC
    `);
    const harvests = harvestsResult.rows;

    const result = await db.query(`
      SELECT s.*, h.harvest_date, c.crop_name 
      FROM sales s 
      LEFT JOIN harvests h ON s.harvest_id = h.harvest_id 
      LEFT JOIN crops c ON h.crop_id = c.crop_id 
      ORDER BY s.sale_id
    `);
    res.render('sales', { rows: result.rows, harvests: harvests, error: null });
  } catch (err) {
    res.render('sales', { rows: [], harvests: [], error: err.message });
  }
});

router.post('/add', async (req, res) => {
  const { harvest_id, buyer_name, quantity_sold_kg, price_per_kg, sale_date } = req.body;
  try {
    await db.query(
      'INSERT INTO sales (harvest_id, buyer_name, quantity_sold_kg, price_per_kg, sale_date) VALUES ($1, $2, $3, $4, $5)',
      [harvest_id, buyer_name, quantity_sold_kg, price_per_kg, sale_date]
    );
  } catch (err) { console.error(err.message); }
  res.redirect('/sales');
});

router.post('/delete', async (req, res) => {
  try {
    await db.query('DELETE FROM sales WHERE sale_id = $1', [req.body.sale_id]);
  } catch (err) { console.error(err.message); }
  res.redirect('/sales');
});

module.exports = router;
