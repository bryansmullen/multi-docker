const keys = require('./keys');
const express = require('express');
const cors = require('cors');
const {Pool} = require('pg')
const redis = require('redis')

// express app setup
const app = express();
app.use(cors());
app.use(express.json());

// postgres client setup
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
})

pgClient.on('error', () => console.log('Lost PG Connection'))

pgClient.on("connect", (client) => {
    client
        .query("CREATE TABLE IF NOT EXISTS values (number INT)")
        .catch((err) => console.error(err));
});

// redis client setup
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
})

const redisPublisher = redisClient.duplicate()

// express route handlers
app.get('/', (req, res) => {
    res.send('Hi')
})

app.get('/values/all', async (req, res) => {
    const values = await pgClient.query('SELECT * from values')
    res.send(values.rows)
})

app.get('/values/current', async (req, res) => {
    redisClient.hgetall('values', (err, values) => {
        res.send(values)
    })
    res.send(values.rows)
})

app.post('/values', async (req, res) => {
    const index = req.body.index;
    if (parseInt(index) > 40){
        return res.status(402).send('Value too high')
    }
    redisClient.hset('values', index, 'Nothing yet!')
    redisPublisher.publish('index',index)
    pgClient.query('INSERT INTO values(number) values($1)', [index])

    res.send({working: true})
})

app.listen(5000, ()=>console.log('listening on 5000'))