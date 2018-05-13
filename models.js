'use strict';

const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const bcrypt = require('bcryptjs');
const secret = require('./config').secret;
mongoose.Promise = global.Promise;

const userSchema = new mongoose.Schema({
    email: {type: String, unique: true, lowercase: true, required: [true, "can't be blank"], index: true},
    password: {type: String},
    phoneNumber: {type: String, unique: true, required: true},
    motivatrPhoneNumber: String,
    goalTime: String,
    fb_auth_token: String,
    fb_refresh_token: String,
    fb_id: String,
    salt: String,
    token: String
}, {timestamps: true});

userSchema.plugin(uniqueValidator, {message: 'is already taken.'});


userSchema.methods.validatePassword = function(password) {
    return bcrypt.compare(password, this.password);
};

userSchema.methods.serialize = function(){
    return {
        id:this._id,
        email: this.email,
    };
};

userSchema.statics.hashPassword = function(password) {
    return bcrypt.hash(password, 10);
  };

const UserAccount = mongoose.model('UserAccount', userSchema);

module.exports = {UserAccount};
