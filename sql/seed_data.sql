INSERT INTO farms (farm_name, owner_name, location, area_hectares) VALUES
  ('Green Valley Farm',    'Ram Bahadur', 'Chitwan', 12.5),
  ('Sunrise Agriculture',  'Sita Devi',   'Pokhara',  8.0),
  ('Hill Top Farm',        'Hari Prasad', 'Kaski',    5.5);

INSERT INTO fields (farm_id, field_name, area_hectares, soil_type) VALUES
  (1, 'North Field',   4.0, 'Loamy'),
  (1, 'South Field',   3.5, 'Clay'),
  (2, 'Main Field',    8.0, 'Sandy Loam'),
  (3, 'Terrace Field', 5.5, 'Rocky Loam');

INSERT INTO crops (field_id, crop_name, variety, planting_date, expected_harvest_date, status) VALUES
  (1, 'Rice',   'Mansuli',          '2024-06-15', '2024-10-15', 'harvested'),
  (1, 'Wheat',  'HD-2967',          '2024-11-01', '2025-03-15', 'growing'),
  (2, 'Maize',  'Rampur Composite', '2024-05-01', '2024-08-30', 'harvested'),
  (3, 'Tomato', 'Hybrid-1',         '2024-09-01', '2024-12-01', 'growing');

INSERT INTO sensors (field_id, sensor_type, installed_date) VALUES
  (1, 'soil_moisture', '2024-01-10'),
  (1, 'temperature',   '2024-01-10'),
  (2, 'humidity',      '2024-03-05'),
  (3, 'soil_moisture', '2024-04-20');

INSERT INTO weather (field_id, record_date, temperature, rainfall_mm, humidity) VALUES
  (1, '2024-07-01', 28.5, 12.0, 82),
  (1, '2024-07-02', 27.0,  0.0, 75),
  (2, '2024-07-01', 26.5,  5.5, 78),
  (3, '2024-07-01', 22.0, 20.0, 88);

INSERT INTO fertilizers (crop_id, fertilizer_name, quantity_kg, applied_date) VALUES
  (1, 'Urea',    25.0, '2024-07-01'),
  (1, 'DAP',     15.0, '2024-06-20'),
  (2, 'Potash',  10.0, '2024-11-15'),
  (3, 'Compost', 50.0, '2024-05-05');

INSERT INTO harvests (crop_id, harvest_date, quantity_kg, quality_grade) VALUES
  (1, '2024-10-10', 850.0, 'A'),
  (3, '2024-08-25', 620.0, 'B'),
  (1, '2024-10-12', 200.0, 'B');

INSERT INTO diseases (crop_id, disease_name, detected_date, severity, treatment_notes) VALUES
  (1, 'Rice Blast',     '2024-08-10', 'medium', 'Apply Tricyclazole fungicide'),
  (3, 'Stem Borer',     '2024-06-15', 'high',   'Use Chlorpyrifos immediately'),
  (4, 'Early Blight',   '2024-10-05', 'high',   'Apply Mancozeb every 7 days'),
  (2, 'Powdery Mildew', '2024-12-20', 'low',    'Remove affected leaves, apply sulfur');

INSERT INTO sales (harvest_id, buyer_name, quantity_sold_kg, price_per_kg, sale_date) VALUES
  (1, 'Kathmandu Traders',  500.0, 45.00, '2024-10-20'),
  (1, 'Local Market',       300.0, 40.00, '2024-10-25'),
  (2, 'Pokhara Wholesale',  620.0, 30.00, '2024-09-05'),
  (3, 'Cooperative Store',  200.0, 42.00, '2024-10-22');
