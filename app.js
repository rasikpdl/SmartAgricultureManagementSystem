const express = require('express');
const path    = require('path');
require('dotenv').config();

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));

const farmsRouter       = require('./routes/farms');
const fieldsRouter      = require('./routes/fields');
const cropsRouter       = require('./routes/crops');
const sensorsRouter     = require('./routes/sensors');
const weatherRouter     = require('./routes/weather');
const fertilizersRouter = require('./routes/fertilizers');
const harvestsRouter    = require('./routes/harvests');
const diseasesRouter    = require('./routes/diseases');
const salesRouter       = require('./routes/sales');
const dashboardRouter   = require('./routes/dashboard');

app.use('/farms',       farmsRouter);
app.use('/fields',      fieldsRouter);
app.use('/crops',       cropsRouter);
app.use('/sensors',     sensorsRouter);
app.use('/weather',     weatherRouter);
app.use('/fertilizers', fertilizersRouter);
app.use('/harvests',    harvestsRouter);
app.use('/diseases',    diseasesRouter);
app.use('/sales',       salesRouter);
app.use('/dashboard',   dashboardRouter);

app.get('/', (req, res) => {
  res.redirect('/farms');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});