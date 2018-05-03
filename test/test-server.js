'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const should = chai.should();
const expect = chai.expect;

const {UserAccount} = require('../models');
const {closeServer, runServer, app} = require('../server');
const {TEST_DATABASE_URL} = require('../config');


chai.use(chaiHttp);

function tearDownDb(){
  return new Promise((resolve, reject) => {
    console.warn('Deleting database');
    mongoose.connection.dropDatabase()
      .then(result => resolve(result))
      .catch(err => reject(err));
  });
}

function seedUserData() {
  console.info('seeding user data');
  const seedData = [
    {
      email: 'email@gmail.com',
      phoneNumber: '8057177823',
      password: 'password24'
    },
    {
      email: 'email2',
      phoneNumber: '8675309',
      password: 'bananas'  
    },
    {
      "username": "1",
      "email": "1",
      "phoneNumber": "1",
      "salt": "ab6381081518b1d79067f4966c67b252",
      "hash": "8b998e2e42cb113aab7d36058628e4a9f74818db91812c021a19e83b4fa6cc7d7c2b850f2be942f11bc2076f54d27e502931231b1b1f019eb1380ba17cce9fcbd130f13684ed87888282e6ee2175c1ff428e8498e7cd97532fd3593c6a8c67ce4268341de2c469b41123eae9e8f7a4af3659be99b36dae3e85de84c7a1f60a1e4347d2b67aa3853b1ea2c8e246c80e3aed9382a2d13b9cdcda2dfc898b2cc6d6b255779931a216d590837f835291655a94f1ff275a6404108c2a3a6a39b65715eb877f09c675c0a992965f9d0daa5c59e32c490776fe0d30568a9274f5dd0d8b0b8e285ee258d746a833bfd3304efa94f874b1fb63da230cf171899b2d7160ac0895761f12bd0e0e4cdd3be07ded12bc60625fd00d93c8c2eab1ceef8e1de9e0d509b76ba4b603ade6fff6008348d16491dfd0467fb0ff2af007b8a0c75989e4bd38d7f2905f907fb0122948651f4810c7bdaba9050725959e84fcfb3d936f4bfa1369b3c2cf4b4f0964eaadddb142c156aea72fd1cfc14d91684854e960d8ce9b7019927e85961651d0dc1db78dee57a60c04f5a0b90e2c21aa6e6e3bbc176335e3b002399dfcfe899303de9848a799ce1382d8b91efcaac3448f750a74286f18adc4b318e6edc6ab9dc1fcac5c0ff6b1fec04a85883fe24467bfba0a7a27042b300457f1ded17ca8a2158974134026e07ab1cf0cfcc7cd08a09ab2b250e70e"
    }
  ];
  // this will return a promise
  return UserAccount.insertMany(seedData);
};


describe('users API resource', function (){

  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function(){
    this.timeout(10000);
    return seedUserData();
  });
  
  afterEach(function(){
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });

  describe('POST endpoint', function() {
    it('should add new user account', function(){
      const newUser = {
        email: 'email',
        phoneNumber: '12567109',
        password: 'password'
      };

      return chai.request(app)
      .post('/api/users')
      .send(newUser)
      .then(function(res){
        const user = res.body.user;
        user.should.be.a('object');
        res.should.be.json;
        user.should.include.keys('email', 'phoneNumber');
        user.email.should.equal(newUser.email);
        user.phoneNumber.should.equal(newUser.phoneNumber);
      });
    });
  });

  describe('GET user enpoint', function(){
    it('should return correct user for valid ID', function (){
      const data = {
      }

      return UserAccount
      .findOne()
      .then(user => {
        data.id = user._id;

        return chai.request(app)
          .get('/api/user')
          .send(data)
      })
      .then(res => {
        res.should.be.a('object');
        res.should.be.json;
        res.body.user.should.include.keys('email', 'phoneNumber', 'token');
      });
    });
  });

  describe('PUT user enpoint', function(){
    it('should update user give id and fields to update', function (){
      const data = {
        email: 'newemail',
        password: 'newPassword'
      }

      return UserAccount
      .findOne()
      .then(user => {
        data.id = user._id;

        return chai.request(app)
          .put('/api/user')
          .send(data)
      })
      .then(res => {
        res.should.be.a('object');
        res.should.be.json;
        res.body.user.should.include.keys('email', 'phoneNumber', 'token');
        res.body.user.email.should.equal(data.email);
      });
    });
  });

  describe('POST login endpoint', function(){
    it('should return jwt for valid credentials', function(){
      const userLogin = {
        email: '1',
        password: '1'
      };

      return chai.request(app)
        .post('/api/users/login')
        .send(userLogin)
        .then(res => {
          const user = res.body.user;
          user.should.be.a('object');
          res.should.be.json;
          user.should.include.keys('email', 'phoneNumber', 'token');
          user.email.should.equal(userLogin.email);
        });
    });
  });

  describe('POST home endpoint', function(){
    it('should respond with fitbit data given valid user.id', function(){
      const data = {
      }

      return UserAccount
      .findOne()
      .then(user => {
        data.id = user._id;

        return chai.request(app)
          .post('/api/user/home')
          .send(data)
      })
      .then(res => {
        res.should.be.a('object');
        res.should.be.json;
      });
    });
  });
});