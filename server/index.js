const keys = require('./keys');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const { Pool } = require('pg');

const redis = require('redis');

const port = 5000;

// postgres client setup

const pgClient = new Pool({
  host:     keys.pgHost,
  database: keys.pgDatabase,
  user:     keys.pgUser,
  password: keys.pgPassword
});

pgClient.on('connect', () => {
  pgClient
    .query('CREATE TABLE IF NOT EXISTS values (number INT)')
    .catch(err => console.log(err));
});

// redis client setup

const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
});

const redisPublisher = redisClient.duplicate();

// express app setup

const app = express();

app.use(cors());
app.use(bodyParser.json());

// express route handlers

app.get('/', (req, res) => {
  res.send('OK');
});

app.get('/api/values/all', async (req, res) => {
  const values = await pgClient.query('SELECT * FROM values');

  res.send(values.rows);
})

app.get('/api/values/current', async (req, res) => {
  redisClient.hgetall('values', (err, values) => {
    res.send(values || {});
  });
});

app.post('/api/values', async (req, res) => {
  const index = req.body.index;

  if (parseInt(index) > 40) {
    return res.status(422).send('Index: ' + index + ' (Error: > limit 40)');
  }

  redisClient.hset('values', index, 'Nothing yet!');
  redisPublisher.publish('insert', index);

  pgClient.query('INSERT INTO values (number) VALUES ($1)', [index]);

  res.send('Index: ' + index + ' (OK)');
});


app.listen(port, err => {
  console.log('Listening on port ' + port);
})
