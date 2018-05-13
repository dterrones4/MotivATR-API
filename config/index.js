'use strict';

exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost/motivatr';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost/motivatrTest';
exports.PORT = process.env.PORT || 8080;
exports.secret = 'shhhh its a secret';
exports.JWT_SECRET = process.env.JWT_SECRET || 'developmentSecret';
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
