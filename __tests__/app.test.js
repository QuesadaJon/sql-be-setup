require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token;
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    test.only('returns classes body', async() => {

      const expectation = [
        {
          id: 1,
          class: 'Paladin',
          role: 'Tank',
          cool_factor: 4,
          base_game: true
        },
        {
          id: 2,
          class: 'Warrior',
          role: 'Tank',
          cool_factor: 3,
          base_game: true
        },
        {
          id: 3,
          class:'Dark Knight',
          role: 'Tank',
          cool_factor: 7,
          base_game: false
        },
        {
          id: 4,
          class:  'Gunbreaker',
          role:   'Tank',
          cool_factor: 7,
          base_game: false
        },
        {
          id: 5,
          class:  'Astrologian',
          role:   'Healer',
          cool_factor: 5,
          base_game: false
        },
        {
          id: 6,
          class:  'Scholar',
          role:   'Healer',
          cool_factor: 2,
          base_game: true
        },
        {
          id: 7,
          class:  'White Mage',
          role:   'Healer',
          cool_factor: 1,
          base_game: true
        },
        {
          id: 8,
          class: 'Monk',
          role: 'Melee DPS',
          cool_factor: 8,
          base_game: true
        },
        {
          id: 9,
          class: 'Dragoon',
          role: 'Melee DPS',
          cool_factor: 9,
          base_game: true
        },
        {
          id: 10,
          class: 'Ninja',
          role: 'Melee DPS',
          cool_factor: 8,
          base_game: true
        },
        {
          id: 11,
          class: 'Samurai',
          role: 'Melee DPS',
          cool_factor: 5,
          base_game: false
        },
        {
          id: 12,
          class: 'Bard',
          role: 'Ranged Physical DPS',
          cool_factor: 10,
          base_game: true
        },
        {
          id: 13,
          class: 'Machinist',
          role: 'Ranged Physical DPS',
          cool_factor: 8,
          base_game: false
        },
        {
          id: 14,
          class: 'Dancer',
          role: 'Ranged Physical DPS',
          cool_factor: 8,
          base_game: false
        },
        {
          id: 15,
          class: 'Black Mage',
          role: 'Ranged Magical DPS',
          cool_factor: 10,
          base_game: true
        },
        {
          id: 16,
          class: 'Summoner',
          role: 'Ranged Magical DPS',
          cool_factor: 10,
          base_game: true
        },
        {
          id: 18,
          class: 'Red Mage',
          role: 'Ranged Magical DPS',
          cool_factor: 10,
          base_game: false
        }
      ];

      const data = await fakeRequest(app)
        .get('/classes')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('take an id and return that specific class', async() =>{
      const expectation = {
        id: 10,
        name: 'Ninja',
        cool_factor: 8,
        base_game: true,
        role_id: 3,
        owner_id: 1
      };

      const data = await fakeRequest(app)
        .get('/classes/10')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(data.body).toEqual(expectation);
    });

    test('adds a class to the database and returns it', async() =>{
      const expectation = {
        id: 18,
        name: 'Time Mage',
        cool_factor: 10,
        base_game: false,
        role_id: 5,
        owner_id: 1
      };

      const data = await fakeRequest(app)
        .post('/classes')
        .send({
          name: 'Time Mage',
          cool_factor: 10,
          base_game: false,
          role_id: 5,
          owner_id: 1
        });
      
      const allClasses = await fakeRequest(app)
        .get('/classes')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
      expect(allClasses.body.length).toEqual(18);
    });

    test('should change existing object to send value and return it', async() => {
      const expectation = {
        id: 18,
        name: 'Fancy Pants Mage',
        cool_factor: 1000,
        base_game: false,
        role_id: 6,
        owner_id: 1
      };

      const data = await fakeRequest(app)
        .put('/classes/18')
        .send({
          name: 'Fancy Pants Mage',
          cool_factor: 1000,
          base_game: false,
          role_id: 6,
          owner_id: 1
        });

      const allClasses = await fakeRequest(app)
        .get('/classes')
        .expect('Content-Type', /json/)
        .expect(200);
      expect(data.body).toEqual(expectation);
      expect(allClasses.body.length).toEqual(18);
    });

    test('should remove object from existing body and return nothing', async() =>{
      const data = await fakeRequest(app)
        .delete('/classes/17');
        

      const allClasses = await fakeRequest(app)
        .get('/classes')
        .expect('Content-Type', /json/)
        .expect(200);
      expect(data.body).toEqual('');
      expect(allClasses.body.length).toEqual(17);
    });

  });
});