if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');

const indexRouter = require('./routes/index');

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');

app.use(expressLayouts);
app.use(express.static('public'));

app.use('/', indexRouter);

const localPort = 3000;

app.listen(process.env.PORT || localPort, () => {
  console.log(
    `Listening on port ${localPort} - go to http://localhost:${localPort}`
  );
});

mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true
});

const db = mongoose.connection;
db.on('error', error => console.log(error));
db.once('open', () => {
  console.log('Connected to Mangoose');
});
