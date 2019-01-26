const axios = require('axios');
const bcrypt = require('bcryptjs');

const db = require('../database/dbConfig');
const { authenticate, generateToken } = require('../auth/authenticate');

module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};

function register(req, res) {
  const user = req.body;

  user.password = bcrypt.hashSync(user.password);
  db('users')
    .insert(user)
    .then(ids => res.status(201).json({ id: ids[0] }))
    .catch(err => res.status(500).json(err));
}

function login(req, res) {
  const user = req.body;

  db('users')
    .where('username', user.username)
    .then(users => {
      if (users.length && bcrypt.compareSync(user.password, users[0].password)) {
        const token = generateToken(users[0]);
        res.json({ message: 'Login successful', token });
      } else {
        res.status(401).json({ error: 'Invalid username or password' });
      }
    })
    .catch(err => res.status(500).json(err));
}

function getJokes(req, res) {
  const requestOptions = {
    headers: { accept: 'application/json' },
  };

  axios
    .get('https://icanhazdadjoke.com/search', requestOptions)
    .then(response => {
      res.status(200).json(response.data.results);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error Fetching Jokes', error: err });
    });
}
