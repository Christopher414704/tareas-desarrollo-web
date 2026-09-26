require('dotenv').config();

const express = require('express');
const session = require('express-session');

const PgSession =
  require('connect-pg-simple')(session);

const cursoRoutes =
  require('./routes/cursoRoutes');

const authRoutes =
  require('./routes/authRoutes');

const app = express();

app.use(express.json());


app.use(
  session({
    store: new PgSession({
      conString:
        `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,

      createTableIfMissing: true
    }),

    secret: process.env.SESSION_SECRET,

    resave: false,

    saveUninitialized: false,

    cookie: {
      maxAge: 1000 * 60 * 60
    }
  })
);


app.use('/auth', authRoutes);

app.use('/cursos', cursoRoutes);


app.get('/sesion', (req, res) => {
  req.session.visitas =
    (req.session.visitas || 0) + 1;

  res.json({
    visitas: req.session.visitas
  });
});


module.exports = app;