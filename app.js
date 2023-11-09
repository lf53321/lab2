require('dotenv').config();
const express =require('express');
const bcrypt = require('bcrypt');
const app = express();
const port = 3001
const cookieParser = require('cookie-parser');
const session = require('express-session');
const pgp = require('pg-promise')();
const db = pgp({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl : true
});

const path = require('path')
app.use('/', express.static(path.join(__dirname, '/lab2_frontend/build')))

app.use(express.json());

app.use(cookieParser());

app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    maxAge: 3600000
  }
}));


async function findUser(username) {
  try {
    const query = 'SELECT * FROM users WHERE username = $1';
    return await db.query(query, [username]);
  } catch (error) {
    console.error('Dogodila se pogreška:', error);
    throw error;
  }
}

app.post('/login', async (req, res) => {
  const {username, password} = req.body;
  let user = await findUser(username)
  bcrypt.compare(password, user[0].password, (err, isMatch) => {
    if (isMatch) {
      req.session.isAuthenticated = true;
      const sessionCookie = req.cookies['connect.sid'];
      res.cookie('sessionCookie', sessionCookie, {httpOnly: true});
      res.json({isAuthenticated: true, err: ''});
    } else {
      res.json({isAuthenticated: false, err: "Podaci za pristup su pogrešni"});
    }
  });
});

app.post('/login/vulnerable', async (req, res) => {
  const {username, password} = req.body;
  let user = await findUser(username)
  console.log(user)
  if (!user[0]) {
    res.json({isAuthenticated: false, err: "Korisničko ime ne postoji"});
    return
  }
  bcrypt.compare(password, user[0].password, (err, isMatch) => {
    if (isMatch) {
      req.session.isAuthenticated = true;
      const sessionCookie = req.cookies['connect.sid'];
      res.cookie('sessionCookie', sessionCookie, {httpOnly: false});
      res.json({isAuthenticated: true, err: ''});
    } else {
      res.json({isAuthenticated: false, err: "Lozinka ne odgovara korisničkom imenu"});
    }
  });
});

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error(err);
    } else {
      res.json({ isAuthenticated: false });
    }
  });
});

app.get('/session', (req, res) => {
  const isAuthenticated = req.session.isAuthenticated || false;
  res.json({ isAuthenticated });
});

app.get('/vulnerable', async (req, res) => {
  const userInput = req.query.inputSQL;
  console.log(userInput)
  const query = `SELECT name, grade FROM students WHERE JMBAG = '${userInput}'`;

  db.any(query)
      .then((data) => {
        res.json(data);
      })
      .catch((error) => {
        res.status(500).json({ error: 'Dogodila se pogreška' });
      });
});

app.get('/secure', async (req, res) => {
  const userInput = req.query.inputSQL;
  console.log(userInput)
  const query = {
    text: 'SELECT name, grade FROM students WHERE JMBAG = $1',
    values: [userInput],
  };

  db.any(query)
      .then((data) => {
        res.json(data);
      })
      .catch((error) => {
        console.log(error)
        res.status(500).json({ error: 'Dogodila se pogreška' });
      });
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});