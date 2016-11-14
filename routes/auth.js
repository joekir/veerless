const express = require('express'),
    router = express.Router(),
    csrf = require('csurf'),
    process = require('process');

const lhh = require(process.env.NODE_PATH + '/src/lhh');

router.use(lhh.authCheck(true));
var csrfProtection = csrf({ cookie: true });

router.get('/', csrfProtection, function(req,res,next){
  res.render('final', {
    'title': "Secret Area, oooooh!" ,
    'details': "You can only access this if you have submitted a valid lamport hash, more details on this:",
    'link' : 'https://josephkirwin.com',
    'csrf': req.csrfToken()
  });
});

module.exports = router;
