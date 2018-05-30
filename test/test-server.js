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
        email: 'email9@gmail.com',
        phoneNumber: '12567109',
        password: 'password9'
      };

      return chai.request(app)
      .post('/api/user')
      .send(newUser)
      .then(function(res){
        console.log(res.body);
        const user = res.body;
        user.should.be.a('object');
        res.should.be.json;
        user.should.include.keys('email', 'id');
        user.email.should.equal(newUser.email);
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
        res.body.user.should.include.keys('email', 'id');
      });
    });
  });

  describe('PUT user enpoint', function(){
    it('should update user given id and fields to update', function (){
      const data = {
        email: 'newemail'
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
        res.body.user.should.include.keys('email', 'id');
        res.body.user.email.should.equal(data.email);
      });
    });
  });

  /*describe('POST login endpoint', function(){
    it('should return jwt for valid credentials', function(){
      const userLogin = {
        email: 'email@gmail.com',
        password: 'password24'
      };

      return chai.request(app)
        .post('/api/auth/login')
        .send(userLogin)
        .then(res => {
          res.should.be.a('object');
          res.should.be.json;
          res.should.include.keys('authToken');
        });
    });
  });*/

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