const express = require('express'),
      router = express.Router(),
      csrf = require('csurf'),
      process = require('process');

const otp = require(process.env.NODE_PATH + '/src/otp'),
      lhh = require(process.env.NODE_PATH + '/src/lhh');

var csrfProtection = csrf({ cookie: true })

// Authentication is not required for these
// but still need to decrement LHH
router.use(lhh.authCheck(false));

router.get('/', csrfProtection, function(req, res, next) {
  res.render('register', {
          title: 'Veerless - ServerSecret Registration',
          csrf: req.csrfToken()
  });
});

router.post('/',csrfProtection, function(req, res, next) {
  var name = req.body.username.toLowerCase();

  otp.getServerSecret(name,function(err,serversecret,t0){
       if(err){
         res.render('error',{
           message: 'Error occured fetching serversecret',
           error : err
         });
       } else {
          res.render('registercomplete', {
            title: 'ServerSecret',
            csrf: req.csrfToken(),
            serversecret: serversecret,
            timeCreated: t0
          });
       }
  });
});

module.exports = router;
