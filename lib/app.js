const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/classes', async(req, res) => {
  try {
    const data = await client.query(`
      select 
        classes.id, 
        classes.name as Class, 
        roles.name as Role, 
        classes.cool_factor, 
        classes.base_game, 
        classes.owner_id
      from classes
      join roles
      on roles.id = classes.role_id`);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/roles', async(req, res) => {
  try {
    const data = await client.query('select * from roles');
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/classes/:id', async(req, res) => {
  try {
    const classId = req.params.id;
    
    const data = await client.query(`
      select 
        classes.id, 
        classes.name as Class, 
        roles.name as Role, 
        classes.cool_factor, 
        classes.base_game, 
        classes.owner_id
      from classes
      join roles
      on roles.id = classes.role_id
      WHERE classes.id=$1
    `,
    [classId]);

    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/classes/', async(req, res) => {
  try {
    const newName = req.body.name;
    const newCoolFactor = req.body.cool_factor;
    const newBaseGame = req.body.base_game;
    const newRole = req.body.role_id;
    const newOwnerId = req.body.owner_id;

    const data = await client.query(`
      INSERT INTO classes (name, role_id, cool_factor, base_game, owner_id)
      VALUES($1, $2, $3, $4, $5)
      RETURNING *
    `,
    [newName, newRole, newCoolFactor, newBaseGame, newOwnerId]);

    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/classes/:id', async(req, res) =>{
  try {  
    const newName = req.body.name;
    const newCoolFactor = req.body.cool_factor;
    const newBaseGame = req.body.base_game;
    const newRole = req.body.role_id;
    const newOwnerId = req.body.owner_id;
  
    const data = await client.query(`
      UPDATE classes
      SET name = $1,
      cool_factor = $2,
      base_game = $3,
      role_id = $4,
      owner_id = $5
      WHERE classes.id = $6
      RETURNING *
      `,
    [newName, newCoolFactor, newBaseGame, newRole, newOwnerId, req.params.id]);
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/classes/:id', async(req, res) =>{
  try {
    const classId = req.params.id;

    const data = await client.query(`
        DELETE from classes
        WHERE classes.id=$1
    `,
    [classId]);

    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;
