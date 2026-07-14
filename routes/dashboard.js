const express = require('express');
const router  = express.Router();
const db      = require('../db');

router.get('/', async (req, res) => {
  try {
    /* ──────────────────────────────────────────────
       1. KPI COUNTS  (simple COUNT)
    ────────────────────────────────────────────── */
    const farmsCount       = (await db.query('SELECT COUNT(*) FROM farms')).rows[0].count;
    const fieldsCount      = (await db.query('SELECT COUNT(*) FROM fields')).rows[0].count;
    const cropsCount       = (await db.query('SELECT COUNT(*) FROM crops')).rows[0].count;
    const sensorsCount     = (await db.query('SELECT COUNT(*) FROM sensors')).rows[0].count;
    const harvestsCount    = (await db.query('SELECT COUNT(*) FROM harvests')).rows[0].count;
    const diseasesCount    = (await db.query('SELECT COUNT(*) FROM diseases')).rows[0].count;
    const salesCount       = (await db.query('SELECT COUNT(*) FROM sales')).rows[0].count;

    /* ──────────────────────────────────────────────
       2. AGGREGATE TOTALS  (SUM)
    ────────────────────────────────────────────── */
    const totalRevenue = (await db.query(
      `SELECT COALESCE(SUM(quantity_sold_kg * price_per_kg), 0) AS revenue FROM sales`
    )).rows[0].revenue;

    const totalHarvestYield = (await db.query(
      `SELECT COALESCE(SUM(quantity_kg), 0) AS total_yield FROM harvests`
    )).rows[0].total_yield;

    const totalFarmArea = (await db.query(
      `SELECT COALESCE(SUM(area_hectares), 0) AS total_area FROM farms`
    )).rows[0].total_area;

    /* ──────────────────────────────────────────────
       3. HARVEST BY CROP  (INNER JOIN + GROUP BY)
       harvests → crops  (via crop_id)
    ────────────────────────────────────────────── */
    const harvestByCrop = (await db.query(`
      SELECT c.crop_name,
             SUM(h.quantity_kg)   AS total_kg,
             COUNT(h.harvest_id)  AS harvest_count
        FROM harvests h
        INNER JOIN crops c ON c.crop_id = h.crop_id
       GROUP BY c.crop_name
       ORDER BY total_kg DESC
    `)).rows;

    /* ──────────────────────────────────────────────
       4. SALES REVENUE BY CROP  (multi-table JOIN)
       sales → harvests → crops
    ────────────────────────────────────────────── */
    const salesByCrop = (await db.query(`
      SELECT c.crop_name,
             SUM(s.quantity_sold_kg * s.price_per_kg) AS revenue,
             SUM(s.quantity_sold_kg)                  AS qty_sold
        FROM sales s
        INNER JOIN harvests h ON h.harvest_id = s.harvest_id
        INNER JOIN crops    c ON c.crop_id    = h.crop_id
       GROUP BY c.crop_name
       ORDER BY revenue DESC
    `)).rows;

    /* ──────────────────────────────────────────────
       5. CROP STATUS DISTRIBUTION  (GROUP BY)
    ────────────────────────────────────────────── */
    const cropStatus = (await db.query(`
      SELECT status, COUNT(*) AS cnt
        FROM crops
       GROUP BY status
       ORDER BY cnt DESC
    `)).rows;

    /* ──────────────────────────────────────────────
       6. DISEASE COUNT BY SEVERITY  (GROUP BY)
    ────────────────────────────────────────────── */
    const diseaseBySeverity = (await db.query(`
      SELECT severity, COUNT(*) AS cnt
        FROM diseases
       GROUP BY severity
       ORDER BY cnt DESC
    `)).rows;

    /* ──────────────────────────────────────────────
       7. FARM OVERVIEW TABLE  (LEFT JOIN + aggregation)
       farms ← fields  (count fields, sum area)
    ────────────────────────────────────────────── */
    const farmOverview = (await db.query(`
      SELECT f.farm_name,
             f.owner_name,
             f.location,
             f.area_hectares,
             COUNT(fi.field_id)            AS field_count,
             COALESCE(SUM(fi.area_hectares), 0) AS fields_area
        FROM farms f
        LEFT JOIN fields fi ON fi.farm_id = f.farm_id
       GROUP BY f.farm_id, f.farm_name, f.owner_name, f.location, f.area_hectares
       ORDER BY f.farm_name
    `)).rows;

    /* ──────────────────────────────────────────────
       8. RECENT SALES TABLE  (multi-table JOIN)
       sales → harvests → crops → fields → farms
    ────────────────────────────────────────────── */
    const recentSales = (await db.query(`
      SELECT s.sale_date,
             s.buyer_name,
             c.crop_name,
             fa.farm_name,
             s.quantity_sold_kg,
             s.price_per_kg,
             (s.quantity_sold_kg * s.price_per_kg) AS line_total
        FROM sales s
        INNER JOIN harvests h  ON h.harvest_id = s.harvest_id
        INNER JOIN crops    c  ON c.crop_id    = h.crop_id
        INNER JOIN fields   fi ON fi.field_id  = c.field_id
        INNER JOIN farms    fa ON fa.farm_id   = fi.farm_id
       ORDER BY s.sale_date DESC
       LIMIT 10
    `)).rows;

    /* ──────────────────────────────────────────────
       9. DISEASE ALERTS TABLE  (multi-table JOIN)
       diseases → crops → fields → farms
    ────────────────────────────────────────────── */
    const diseaseAlerts = (await db.query(`
      SELECT d.disease_name,
             d.severity,
             d.detected_date,
             d.treatment_notes,
             c.crop_name,
             fa.farm_name
        FROM diseases d
        INNER JOIN crops  c  ON c.crop_id   = d.crop_id
        INNER JOIN fields fi ON fi.field_id  = c.field_id
        INNER JOIN farms  fa ON fa.farm_id   = fi.farm_id
       ORDER BY d.detected_date DESC
    `)).rows;

    /* ──────────────────────────────────────────────
       10. WEATHER AVERAGES BY FIELD  (JOIN + AVG)
       weather → fields → farms
    ────────────────────────────────────────────── */
    const weatherAvg = (await db.query(`
      SELECT fi.field_name,
             fa.farm_name,
             ROUND(AVG(w.temperature), 1) AS avg_temp,
             ROUND(AVG(w.rainfall_mm), 1) AS avg_rain,
             ROUND(AVG(w.humidity), 1)     AS avg_humidity,
             COUNT(w.weather_id)           AS readings
        FROM weather w
        INNER JOIN fields fi ON fi.field_id = w.field_id
        INNER JOIN farms  fa ON fa.farm_id  = fi.farm_id
       GROUP BY fi.field_id, fi.field_name, fa.farm_name
       ORDER BY fi.field_name
    `)).rows;

    /* ──────────────────────────────────────────────
       11. FERTILIZER USAGE BY CROP  (JOIN + SUM)
       fertilizers → crops
    ────────────────────────────────────────────── */
    const fertilizerUsage = (await db.query(`
      SELECT c.crop_name,
             f.fertilizer_name,
             SUM(f.quantity_kg)  AS total_kg,
             COUNT(f.fertilizer_id) AS applications
        FROM fertilizers f
        INNER JOIN crops c ON c.crop_id = f.crop_id
       GROUP BY c.crop_name, f.fertilizer_name
       ORDER BY c.crop_name, total_kg DESC
    `)).rows;

    /* ──────────────────────────────────────────────
       12. SENSOR DEPLOYMENT  (JOIN + GROUP BY)
       sensors → fields → farms
    ────────────────────────────────────────────── */
    const sensorsByField = (await db.query(`
      SELECT fi.field_name,
             fa.farm_name,
             COUNT(s.sensor_id)                         AS sensor_count,
             STRING_AGG(s.sensor_type, ', ' ORDER BY s.sensor_type) AS types
        FROM sensors s
        INNER JOIN fields fi ON fi.field_id = s.field_id
        INNER JOIN farms  fa ON fa.farm_id  = fi.farm_id
       GROUP BY fi.field_id, fi.field_name, fa.farm_name
       ORDER BY sensor_count DESC
    `)).rows;

    /* ──────────────────────────────────────────────
       13. HARVEST QUALITY DISTRIBUTION  (GROUP BY)
    ────────────────────────────────────────────── */
    const harvestQuality = (await db.query(`
      SELECT quality_grade, COUNT(*) AS cnt,
             SUM(quantity_kg) AS total_kg
        FROM harvests
       GROUP BY quality_grade
       ORDER BY quality_grade
    `)).rows;

    /* ──────────────────────────────────────────────
       Pass everything to the view
    ────────────────────────────────────────────── */
    res.render('dashboard', {
      // KPI
      farmsCount, fieldsCount, cropsCount, sensorsCount,
      harvestsCount, diseasesCount, salesCount,
      totalRevenue, totalHarvestYield, totalFarmArea,
      // Chart data
      harvestByCrop, salesByCrop, cropStatus,
      diseaseBySeverity, harvestQuality,
      // Tables
      farmOverview, recentSales, diseaseAlerts,
      weatherAvg, fertilizerUsage, sensorsByField,
      error: null
    });

  } catch (err) {
    console.error('Dashboard error:', err.message);
    res.render('dashboard', {
      farmsCount: 0, fieldsCount: 0, cropsCount: 0, sensorsCount: 0,
      harvestsCount: 0, diseasesCount: 0, salesCount: 0,
      totalRevenue: 0, totalHarvestYield: 0, totalFarmArea: 0,
      harvestByCrop: [], salesByCrop: [], cropStatus: [],
      diseaseBySeverity: [], harvestQuality: [],
      farmOverview: [], recentSales: [], diseaseAlerts: [],
      weatherAvg: [], fertilizerUsage: [], sensorsByField: [],
      error: err.message
    });
  }
});

module.exports = router;
