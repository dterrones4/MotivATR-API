const jwt = require('express-jwt');
const secret = require('../config').secret;

function getTokenFromBody(req){
    let token = req.body.token || req.query.token;
    return token;
}

const auth = {
    required: jwt({
        secret: secret,
        userProperty: 'body',
        getToken: getTokenFromBody
    }),
    optional: jwt({
        secret: secret,
        userProperty: 'body',
        credentialsRequired: false,
        getToken: getTokenFromBody
    })
};

module.exports = auth;