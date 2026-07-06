CREATE TABLE farms (
    farm_id       SERIAL PRIMARY KEY,
    farm_name     VARCHAR(100) NOT NULL,
    owner_name    VARCHAR(100),
    location      VARCHAR(150),
    area_hectares NUMERIC(8,2)
);

CREATE TABLE fields (
    field_id      SERIAL PRIMARY KEY,
    farm_id       INT REFERENCES farms(farm_id) ON DELETE CASCADE,
    field_name    VARCHAR(100),
    area_hectares NUMERIC(8,2),
    soil_type     VARCHAR(50)
);

CREATE TABLE crops (
    crop_id               SERIAL PRIMARY KEY,
    field_id              INT REFERENCES fields(field_id) ON DELETE CASCADE,
    crop_name             VARCHAR(100),
    variety               VARCHAR(100),
    planting_date         DATE,
    expected_harvest_date DATE,
    status                VARCHAR(20) DEFAULT 'growing'
);

CREATE TABLE sensors (
    sensor_id      SERIAL PRIMARY KEY,
    field_id       INT REFERENCES fields(field_id) ON DELETE CASCADE,
    sensor_type    VARCHAR(50),
    installed_date DATE
);

CREATE TABLE weather (
    weather_id  SERIAL PRIMARY KEY,
    field_id    INT REFERENCES fields(field_id) ON DELETE CASCADE,
    record_date DATE,
    temperature NUMERIC(5,2),
    rainfall_mm NUMERIC(6,2),
    humidity    NUMERIC(5,2)
);

CREATE TABLE fertilizers (
    fertilizer_id   SERIAL PRIMARY KEY,
    crop_id         INT REFERENCES crops(crop_id) ON DELETE CASCADE,
    fertilizer_name VARCHAR(100),
    quantity_kg     NUMERIC(8,2),
    applied_date    DATE
);

CREATE TABLE harvests (
    harvest_id    SERIAL PRIMARY KEY,
    crop_id       INT REFERENCES crops(crop_id) ON DELETE CASCADE,
    harvest_date  DATE,
    quantity_kg   NUMERIC(8,2),
    quality_grade VARCHAR(20)
);

CREATE TABLE diseases (
    disease_id      SERIAL PRIMARY KEY,
    crop_id         INT REFERENCES crops(crop_id) ON DELETE CASCADE,
    disease_name    VARCHAR(100),
    detected_date   DATE,
    severity        VARCHAR(20),
    treatment_notes TEXT
);

CREATE TABLE sales (
    sale_id          SERIAL PRIMARY KEY,
    harvest_id       INT REFERENCES harvests(harvest_id) ON DELETE CASCADE,
    buyer_name       VARCHAR(100),
    quantity_sold_kg NUMERIC(8,2),
    price_per_kg     NUMERIC(8,2),
    sale_date        DATE
);
