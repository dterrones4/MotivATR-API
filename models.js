'use strict';

const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
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
    hash: String,
    salt: String,
    token: String
}, {timestamps: true});

userSchema.plugin(uniqueValidator, {message: 'is already taken.'});

userSchema.methods.setPassword = function(password){
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10, 512, 'sha512').toString('hex');
};

userSchema.methods.validPassword = function(password) {
    let hash = crypto.pbkdf2Sync(password, this.salt, 10, 512, 'sha512').toString('hex');
    return this.hash === hash;
};

userSchema.methods.generateJWT = function() {
    let today = new Date();
    let exp = new Date(today);
    exp.setDate(today.getDate() + 30);

    return jwt.sign({
        id: this._id,
        email: this.email,
        exp: parseInt(exp.getTime() / 1000),
    }, secret);
};

userSchema.methods.serialize = function(){
    return {
        id:this._id,
        email: this.email,
        phoneNumber: this.phoneNumber,
        token: this.generateJWT()
    };
};

const UserAccount = mongoose.model('UserAccount', userSchema);

module.exports = {UserAccount};
