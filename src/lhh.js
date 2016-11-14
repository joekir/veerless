const process = require('process'),
       crypto = require('crypto');

const config = require(process.env.NODE_PATH + '/config.js'),
          db = require(process.env.NODE_PATH + '/src/db/db.js'),
         alg = 'sha256';

function verifyHash(username, hash, done){
  db.getLH(username, (err, result) => {
    if (err){
      return done(err,null);
    }

    //console.log("challenge: %s, stored: %s", hash, result.hash);

    if(hash === result.hash){
      if(result.iter <= 1)
        return done(null,false);

      --result.iter;
      db.updateLH(username, genHash(result.secret, result.iter), result.iter)
      return done(null,true);
    }

    done(null,false);
  });
}

/*
 * Express Middleware
 *
`* Because the client has no clue if they need to provide LHH auth token
 * or not, we need to always decrement it, even if the auth is not required
 * hence the option here.
*/
function authCheck(required){
  return function(req,res,next){
    // All headers get lowercased
    if ((req.headers['x-lhh'] === undefined || req.signedCookies['lhh_username'] === undefined) && required)
      return res.redirect(403,'/login');

    verifyHash(req.signedCookies['lhh_username'], req.headers['x-lhh'], (err,result) => {
      //console.log("hash verification result: " + result);
      if((err != null || result === false) && required)
        return res.redirect(403,'/login');

      next()
    });
  }
}

function genHash(seed,i){
  while(i > 0){
    seed = crypto.createHash(alg).update(seed).digest('hex');
    i--;
  }
  return seed;
}

function genSecret(username) {
  var secret = crypto.randomBytes(16).toString('hex');
  var iter = config.sessionLimit;
  var hash = genHash(secret,iter)

  db.setLH(username, secret, hash, iter);

  return {
    "secret" : secret,
    "iter"   : iter
  }
}

module.exports = {
  genSecret,
  verifyHash,
  authCheck
};
