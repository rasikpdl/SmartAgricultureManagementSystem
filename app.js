const express = require('express');
const path    = require('path');
require('dotenv').config();

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));

const farmsRouter = require('./routes/farms');
const fieldsRouter = require('./routes/fields');
const cropsRouter = require('./routes/crops');

app.use('/farms', farmsRouter);
app.use('/fields', fieldsRouter);
app.use('/crops', cropsRouter);

app.get('/', (req, res) => {
  res.redirect('/farms');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
