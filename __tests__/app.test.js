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

    test('returns classes body', async() => {

      const expectation = [
        {
          id: 1,
          name: 'Paladin',
          cool_factor: 4,
          base_game: true,
          role: 'Tank',
          owner_id: 1,
        },
        {
          id: 2,
          name: 'Warrior',
          cool_factor: 3,
          base_game: true,
          role: 'Tank',
          owner_id: 1,
        },
        {
          id: 3,
          name: 'Dark Knight',
          cool_factor: 7,
          base_game: false,
          role: 'Tank',
          owner_id: 1,
        },
        {
          id: 4,
          name: 'Gunbreaker',
          cool_factor: 7,
          base_game: false,
          role: 'Tank',
          owner_id: 1,
        },
        {
          id: 5,
          name: 'Astrologian',
          cool_factor: 5,
          base_game: false,
          role: 'Healer',
          owner_id: 1,
        },
        {
          id: 6,
          name: 'Scholar',
          cool_factor: 2,
          base_game: true,
          role: 'Healer',
          owner_id: 1,
        },
        {
          id: 7,
          name: 'White Mage',
          cool_factor: 1,
          base_game: true,
          role: 'Healer',
          owner_id: 1,
        },
        {
          id: 8,
          name: 'Monk',
          cool_factor: 8,
          base_game: true,
          role: 'Melee DPS',
          owner_id: 1,
        },
        {
          id: 9,
          name: 'Dragoon',
          cool_factor: 9,
          base_game: true,
          role: 'Melee DPS',
          owner_id: 1,
        },
        {
          id: 10,
          name: 'Ninja',
          cool_factor: 8,
          base_game: true,
          role: 'Melee DPS',
          owner_id: 1,
        },
        {
          id: 11,
          name: 'Samurai',
          cool_factor: 5,
          base_game: false,
          role: 'Melee DPS',
          owner_id: 1,
        },
        {
          id: 12,
          name: 'Bard',
          cool_factor: 10,
          base_game: true,
          role: 'Ranged Physical DPS',
          owner_id: 1,
        },
        {
          id: 13,
          name: 'Machinist',
          cool_factor: 8,
          base_game: false,
          role: 'Ranged Physical DPS',
          owner_id: 1,
        },
        {
          id: 14,
          name: 'Dancer',
          cool_factor: 8,
          base_game: false,
          role: 'Ranged Physical DPS',
          owner_id: 1,
        },
        {
          id: 15,
          name: 'Black Mage',
          cool_factor: 10,
          base_game: true,
          role: 'Ranged Magical DPS',
          owner_id: 1,
        },
        {
          id: 16,
          name: 'Summoner',
          cool_factor: 10,
          base_game: true,
          role: 'Ranged Magical DPS',
          owner_id: 1
        },
        {
          id: 17,
          name: 'Red Mage',
          cool_factor: 10,
          base_game: false,
          role: 'Ranged Magical DPS',
          owner_id: 1
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
        role: 'Melee DPS',
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
        role: 'Ranged Magical DPS',
        owner_id: 1
      };

      const data = await fakeRequest(app)
        .post('/classes')
        .send({
          name: 'Time Mage',
          cool_factor: 10,
          base_game: false,
          role: 'Ranged Magical DPS',
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
        id: 19,
        name: 'Fancy Pants Mage',
        cool_factor: 1000,
        base_game: false,
        role: 'Ungodly OP carry',
        owner_id: 1
      };

      const data = await fakeRequest(app)
        .post('/classes')
        .send({
          name: 'Fancy Pants Mage',
          cool_factor: 1000,
          base_game: false,
          role: 'Ungodly OP carry',
          owner_id: 1
        });

      const allClasses = await fakeRequest(app)
        .get('/classes')
        .expect('Content-Type', /json/)
        .expect(200);
      expect(data.body).toEqual(expectation);
      expect(allClasses.body.length).toEqual(19);
    });

    test('should remove object from existing body and return nothing', async() =>{
      const data = await fakeRequest(app)
        .delete('/classes/19');
        

      const allClasses = await fakeRequest(app)
        .get('/classes')
        .expect('Content-Type', /json/)
        .expect(200);
      expect(data.body).toEqual('');
      expect(allClasses.body.length).toEqual(18);
    });

  });
});