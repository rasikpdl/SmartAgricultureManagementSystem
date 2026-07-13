const express = require('express');
const router  = express.Router();
const db      = require('../db');

router.get('/', async (req, res) => {
  try {
    // We can run summary queries here. For now, we will just pass basic counts
    const harvestsCountResult = await db.query('SELECT COUNT(*) FROM harvests');
    const salesCountResult = await db.query('SELECT COUNT(*) FROM sales');
    const diseasesCountResult = await db.query('SELECT COUNT(*) FROM diseases');

    res.render('dashboard', { 
      harvestsCount: harvestsCountResult.rows[0].count,
      salesCount: salesCountResult.rows[0].count,
      diseasesCount: diseasesCountResult.rows[0].count,
      error: null 
    });
  } catch (err) {
    res.render('dashboard', { 
      harvestsCount: 0, 
      salesCount: 0, 
      diseasesCount: 0, 
      error: err.message 
    });
  }
});

module.exports = router;
