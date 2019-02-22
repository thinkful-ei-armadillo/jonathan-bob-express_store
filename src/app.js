'use strict';
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const uuid = require('uuid/v4');

const app = express();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

const users = [{
  'id': '3c8da4d5-1597-46e7-baa1-e402aed70d80',
  'username': 'sallyStudent',
  'password': 'c00d1ng1sc00l',
  'favoriteClub': 'Cache Valley Stone Society',
  'newsLetter': 'true'
},
  
{
  'id': 'ce20079c-2326-4f17-8ac4-f617bfd28b7f',
  'username': 'johnBlocton',
  'password': 'veryg00dpassw0rd',
  'favoriteClub': 'Salt City Curling Club',
  'newsLetter': 'false'
}];

app.use(morgan(morganOption, { skip: () => NODE_ENV === 'test' }));
app.use(express.json());
app.use(helmet());
app.use(cors());

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

app.get('/', (req, res) => {
  res.send('GET Request');
});

app.post('/', (req, res) => {
  console.log(req.body);
  res.send('POST Request');
});

app.post('/register', (req, res) => {
  const { username, password, favoriteClub, newsLetter = false } = req.body;
  const clubs = [
    'Cache Valley Stone Society',
    'Ogden Curling Club',
    'Park City Curling Club',
    'Salt City Curling Club',
    'Utah Olympic Oval Curling Club'
  ];

  if (!username) {
    return res.status(400).send('Username required');

  } else if (username.length < 6 || username.length > 20 )   {
    return res.status(400).send('Username must be between 6 and 20 characters');
  }

  if (!password) {
    return res.status(400).send('Username required');

  } else if (password.length < 8 || password.length > 36) {
    return res.status(400).send('Password must be between 8 and 36 characters');
  }

  if (!favoriteClub) {
    return res.status(400).send('favorite club required');

  } else if (!clubs.includes(favoriteClub)) {
    return res.status(400).send('Not a valid club');
  }

  const id = uuid();
  const newUser = {
    id,
    username,
    password,
    favoriteClub,
    newsLetter
  };

  users.push(newUser);

  res.status(201).location(`http://localhost:8000/user/${id}`).json({id: id});
});

app.delete('/user/:id', (req, res) => {
  const { id } = req.params;
  const index = users.findIndex(u => u.id === id);
  if (index === -1) {
    return res.status(404).send('User not found');
  }
  users.splice(index, 1);
  res.send('Deleted');
});

module.exports = app;
