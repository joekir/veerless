const crypto = require('crypto'),
    os = require('os'),
    dns = require('dns'),
    process = require('process');

const db = require(process.env.NODE_PATH + '/src/db/db'),
    prov = require(process.env.NODE_PATH + '/src/db/provision'),
    step_time = 60000, // 1 minute
    clientSecret = "keyboard cat"; // Not important for this POC

function getServerCode(username, done) {
    getServerSecret(username, function(err, otpkey, t0) {
        if (err) {
            return done(err, null);
        }

        return done(null, generateTOTP(otpkey, t0, longFromIP()));
    });
}

function getServerSecret(username, done) {
    db.fetchServerCode(username, function(err, otpkey, t0) {
        if (err) {
            return done(err, null);
        }

        return done(null, otpkey, t0);
    });
};

/*
 * produces the HMAC(key,TOTP|IP) code
 * See RFC 6238 and 4226 Section 9
 */
var generateTOTP = function(otpkey, t0, ipAddress) {
    const hmac = crypto.createHmac('sha256', otpkey);

    var t = Math.floor((Date.now() - t0) / step_time);
    var input = t.toString() + ipAddress.toString();
    hmac.update(input);

    // Super crude truncation alg, a better one should be used in a non POC.
    // Though the design of hmac is such that truncation shouldn't easily
    // yield an existential forgery
    return hmac.digest('hex').substring(0, 6);
};

/*
 * I realized later that I could probably obtain this from http/express
 * and set on a global, but http.server().address() doesn't give the public IP
 * so I just hand rolled it here.
 */
var longFromIP = function() {
    var netInfs = os.networkInterfaces();
    var addr

    for (let i in netInfs) {
        let match = netInfs[i]
            .filter(x => x.internal === false && x.family === 'IPv4')[0]

        if (match)
            addr = match.address
    }

    console.log(netInfs);
    console.log("local IP address set as : " + addr);

    // IP to long
    // This was stolen from an online Gist, I liked how susinct it was
    // https://gist.github.com/monkeym4ster/7eff5843863f2b373a1e/
    // Its hard to improve on that ;)
    var ipl = 0;
    addr.split('.').forEach(function(octet) {
        ipl <<= 8;
        ipl += parseInt(octet);
    });
    return (ipl >>> 0);

};

/*
 * This must NOT fail fast, every check MUST be evaluated
 * to avoid sidechannel attacks
 */
var finalAuthenticate = function(username, c_servercode, c_clientcode, c_password,done) {
    var outcome = true;

    getServerCode(username, function(err, res) {
        if (err) {
            throw err;
        }

        if (c_servercode !== res) {
            outcome = false;
        }

        getServerSecret(username, function(err, otpkey, t0) {
            if (err) {
                throw err;
            }

            // We're just discarding the serverside otpkey here
            // Also the client code doesn't need the IP pinning for this demo
            if (generateTOTP(clientSecret, t0, '') !== c_clientcode) {
                outcome = false;
            }

            db.getPassHash(username, function(err, storedHash, storedSalt) {

                crypto.pbkdf2(c_password, storedSalt, prov.iters, prov.outlength, prov.alg, (err, computedHash) => {

                    if (err) {
                        throw err;
                    }

                    if (computedHash.toString('hex') !== storedHash) {
                        outcome = false;
                    }

                    done(outcome);
                })
            });

        });


    })
};

module.exports = {
    getServerCode,
    getServerSecret,
    finalAuthenticate
};
