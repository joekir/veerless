const express = require('express'),
      router = express.Router(),
      csrf = require('csurf'),
      process = require('process');

const otp = require(process.env.NODE_PATH + '/src/otp');

var csrfProtection = csrf({ cookie: true })

router.get('/', csrfProtection, function(req, res, next) {
  res.render('register', {
          title: 'Veerless - ServerSecret Registration',
          csrf: req.csrfToken()
  });
});

router.post('/',csrfProtection, function(req, res, next) {
  otp.getServerSecret(req.body.username,function(err,serversecret,t0){
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
