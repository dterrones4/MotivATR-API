const mongoose = require('mongoose');
const router = require('express').Router();
const passport = require('passport');
const UserAccount = mongoose.model('UserAccount')
const path = require('path');
const https = require('https');
const querystring = require('querystring')

router.post('/', function(req, res, next){
    let email = req.body.email;
    let password = req.body.password;
    let phoneNumber = req.body.phoneNumber;

    return UserAccount.hashPassword(password)
    .then(hash => {
        return UserAccount.create({
            email,
            password: hash,
            phoneNumber
        });
    })
    .then(user => {
        return res.status(201).json(user.serialize());
    })
    .catch(err => {
        if(err.reason === 'ValidationError'){
            return res.status(err.code).json(err);
        }
        res.status(500).json({code: 500, message: 'Internal server error'});
    })
});

router.post('/login', function(req, res, next){
    if(!req.body.email){
        return res.status(422).json({errors: {email: "can't be blank"}});
    }

    if(!req.body.password){
        return res.status(422).json({error: {password: "can't be blank"}});
    }

    passport.authenticate('local', {session: false}, function(err, user, info){
        if(err){return next(err); }

        if(user){
            user.token = user.generateJWT();
            return res.json(user.token); 
        } else {
            return res.status(422).json(info);
        }
    })
    (req, res, next);
});

router.get('/fitbitAuth', /*auth.required,*/ function(req, res, next){
    //UserAccount.findById(req.body.id).then(function(user){
        //if(!user){return res.sendStatus(401);}

        return res.sendFile('fitbitAuth.html', {root: './views'});
    });
//});

router.post('/fitbitAuthToken', function (req, res, next){
    let code = req.body.code;
    let fbTokens = '';

    const options = {
        hostname: 'api.fitbit.com',
        method: 'POST',
        path: '/oauth2/token',
        headers: {"Authorization": "Basic MjJDVjkyOjQ5MWZkZTI3MzgzMDZjMTUxOTU0NzVkMzI0Yzg3ZTU1",
        "Content-Type": "application/x-www-form-urlencoded"}
    };
    const query = querystring.stringify({
        clientId: '22CV92',
        grant_type: 'authorization_code',
        redirect_uri: 'http://localhost:3000/fitbitAuthToken',
        code: code
    });

    const request = https.request(options, (response) => {
        response.on('data', (chunk) => {
            fbTokens += chunk;
        });

        response.on('end' , () => {
            return new Promise((resolve, reject) => {
                UserAccount.findById(req.body.id)
                .then(user =>{
                    if(!user){
                        return res.sendStatus(404);
                    }
                    resolve(user);    
                }).catch(err => console.log(err))
            })
            .then(function(user){
                fbTokens = (JSON.parse(fbTokens));

                user.fb_auth_token = fbTokens.access_token;
                user.fb_refresh_token = fbTokens.refresh_token;
                user.fb_id = fbTokens.user_id;

                user.save()
                console.log(user);
            })
            .then(function(){
            return res.json({redirect: '/api/user/home'});
            }).catch(err => console.log(err));
        });

        response.on('error', (err) => {
            console.log("Error:" + err.message);
        });
    });
    request.write(query);
    request.end()
});

router.get('/fitbitAuthToken', function(req, res, next){
    return res.sendFile('fitbitAuthToken.html', {root: './views'});
});

router.get('/home', function(req, res, next){
    return res.sendFile('home.html', {root: './views'});
});

router.get('/demo', function(req, res, next){
    return res.sendFile('demo.html', {root: './views'});
});

router.post('/home', function(req, res, next){
    let body ='';
    UserAccount.findById(req.body.id)
    .then(function(user){
        const options = {
            hostname: 'api.fitbit.com',
            method: 'GET',
            path: `/1/user/${user.fb_id}/activities/date/today.json`,
            headers: {"Authorization": `Bearer ${user.fb_auth_token}`,
            "Content-Type": "application/x-www-form-urlencoded"}
        }
        const request = https.request(options, (response, reject) => {

            response.on('data', (chunk) => {
                body += chunk;
            });

            response.on('end' , () => {
                return new Promise((resolve, reject) => {
                    body = (JSON.parse(body));
                    resolve(body)
                })
                .then(function(body){
                    return res.json(body)
                })
            })
            response.on('error', (err) => {
                console.log("Error:" + err.message);
            });
        });
        request.end()
    }).catch(err =>{console.log(err);})
    //respond with user data to be displayed on front end.
});

router.get('/', /*auth.required,*/ function(req, res, next){
    UserAccount.findById(req.body.id).then(function(user){
        if(!user){return res.sendStatus(401);}

        return res.json({user: user.serialize()})
    }).catch(next);
});

router.put('/', /*auth.required,*/ function(req, res, next){
    UserAccount.findById(req.body.id).then(function(user){
        if(!user){ return res.sendStatus(401); }

        //only update fileds that were actually passed
        if(typeof req.body.email !== 'undefined'){
            user.email = req.body.email;
        }
        if(typeof req.body.phoneNumber !== 'undefined'){
            user.phoneNumber = req.body.phoneNumber;
        }
        if(typeof req.body.password !== 'undefined'){
            user.setPassword(req.body.password);
        }
        if(typeof req.body.motivatrPhoneNumber !== 'undefined'){
            user.motivatrPhoneNumber = req.body.motivatrPhoneNumber;
        }
        if(typeof req.body.goalTime !== 'undefined'){
            user.goalTime = req.body.goalTime;
        }
        
        return user.save().then(function(){
            return res.json({user: user.serialize()});
        });
    }).catch(next);
});


module.exports = router;