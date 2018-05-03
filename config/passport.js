const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const {UserAccount} = require('../models');

passport.use(new localStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, function(email, password, done) {
    UserAccount.findOne({email: email}).then(function(user){
      if(!user || !user.validPassword(password)){
        return done(null, false, {errors: {'email or password': 'is invalid'}});
      }
      return done(null, user);
    }).catch(done);
  }));