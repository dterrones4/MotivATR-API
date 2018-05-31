'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const passport = require('passport');
const errorhandler = require('errorhandler');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
mongoose.Promise = global.Promise;

const {DATABASE_URL, PORT, CLIENT_ORIGIN} = require('./config');
const {UserAccount} = require('./models')
const {localStrategy, jwtStrategy } = require('./strategies');

const app = express();

app.use(morgan('common'));
app.use(bodyParser.json());

app.use(cors({
  origin: CLIENT_ORIGIN
  })
);

passport.use(localStrategy);
passport.use(jwtStrategy);

app.use(require('./routes'));


// closeServer needs access to a server object, but that only
// gets created when `runServer` runs, so we declare `server` here
// and then assign a value to it in run
let server;

//this function connect to our db, then starts the server
function runServer(databaseUrl = DATABASE_URL, port = PORT) {
    return new Promise((resolve, reject) => {
      mongoose.connect(databaseUrl, err => {
        if (err) {
          return reject(err);
        }
        server = app.listen(port, () => {
          console.log(`Your app is listening on port ${port}`);
          resolve();
        })
          .on('error', err => {
            mongoose.disconnect();
            reject(err);
          });
      });
    });
  }
  
function closeServer() {
    return mongoose.disconnect().then(() => {
      return new Promise((resolve, reject) => {
        console.log('Closing server');
        server.close(err => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      });
    });
  }

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
    runServer().catch(err => console.error(err));
}

module.exports =  {runServer, app, closeServer};