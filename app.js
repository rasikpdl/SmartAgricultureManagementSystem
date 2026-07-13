const express = require('express');
const path    = require('path');
require('dotenv').config();

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));

const farmsRouter = require('./routes/farms');
app.use('/farms', farmsRouter);

const sensorsRouter = require('./routes/sensors');
app.use('/sensors', sensorsRouter);

const weatherRouter = require('./routes/weather');
app.use('/weather', weatherRouter);

const fertilizersRouter = require('./routes/fertilizers');
app.use('/fertilizers', fertilizersRouter);

app.get('/', (req, res) => {
  res.redirect('/farms');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
