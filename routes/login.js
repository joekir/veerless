const express = require('express'),
    router = express.Router(),
    csrf = require('csurf'),
    process = require('process');

const otp = require(process.env.NODE_PATH + '/src/otp');

var csrfProtection = csrf({
    cookie: true
})

router.get('/', csrfProtection, function(req, res, next) {
    res.header('X-Veerless-Init','');
    res.render('login', {
        title: 'Veerless Login',
        csrf: req.csrfToken()
    });
});

router.post('/', csrfProtection, function(req, res, next) {
    var name = req.body.username.toLowerCase();
    otp.getServerCode(name, function(err, otpkey) {
        if (err) {
            res.render('error', {
                message: 'Error occured fetching servercode',
                error: err
            });
        }
        else {
            res.header('X-Veerless-Response', otpkey);
            res.render('serverproof', {
                title: 'Login - phase2',
                csrf: req.csrfToken(),
                username: name
            });
        }
    });
});

router.post('/final', csrfProtection, function(req, res, next) {
    var name = req.body.username.toLowerCase();

    otp.finalAuthenticate(name, req.body.clientcode,
            req.body.password, (result) => {

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
