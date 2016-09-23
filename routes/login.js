const express = require('express'),
    router = express.Router(),
    csrf = require('csurf'),
    process = require('process');

const otp = require(process.env.NODE_PATH + '/src/otp');

var csrfProtection = csrf({
    cookie: true
})

router.get('/', csrfProtection, function(req, res, next) {
    res.render('login', {
        title: 'Veerless Login',
        csrf: req.csrfToken()
    });
});

router.post('/', csrfProtection, function(req, res, next) {
    otp.getServerCode(req.body.username, function(err, otpkey) {
        if (err) {
            res.render('error', {
                message: 'Error occured fetching servercode',
                error: err
            });
        } else {
            res.render('serverproof', {
                title: 'Login - phase2',
                csrf: req.csrfToken(),
                username: req.body.username,
                servercode: otpkey
            });
        }
    });
});

router.post('/final', csrfProtection, function(req, res, next) {
    otp.finalAuthenticate(req.body.username, req.body.servercode,
        req.body.clientcode, req.body.password, (result) => {

        var title = (result) ?
                'Welcome to Veerless!' 
                : 'Sorry, we could not verify your credentials.';

        res.render('final', {
            'title': title ,
            'csrf': req.csrfToken()
    });
    });
});

module.exports = router;
