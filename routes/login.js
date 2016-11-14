const express = require('express'),
    router = express.Router(),
    csrf = require('csurf'),
    process = require('process');

const otp = require(process.env.NODE_PATH + '/src/otp'),
      lhh = require(process.env.NODE_PATH + '/src/lhh'),
      config = require(process.env.NODE_PATH + '/config');

var csrfProtection = csrf({ cookie: true });

// Authentication is not required for these
// but still need to decrement LHH
router.use(lhh.authCheck(false));

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
            // console.log("otpkey: %s",otpkey);
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
          var title,details = '';

          if (result) {
            var gen = lhh.genSecret(name);

            // Must be over https!
            res.header('X-LHH-Secret', gen.secret);
            res.header('X-LHH-Iter', gen.iter);
            res.cookie('lhh_username', name, {
              signed: true,
              httpOnly: true,
              //secure: true, enable once deployed.
              domain: config.hostname,
              sameSite: true
            });

            title = 'Welcome to Veerless!';
            details = 'Checkout the /secret page to see if your auth is persisting.'
          }
          else {
            title = 'Sorry, we could not verify your credentials.';
          }

          res.render('final', {
            'title': title ,
            'details': details,
            'link' : '/secret',
            'csrf': req.csrfToken()
          });
      });
});

module.exports = router;
