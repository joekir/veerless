const sqlite3 = require('sqlite3'),
    crypto = require('crypto'),
    fs = require('fs'),
    process = require('process'),
    dbApi = require('./db');

const iters = 100000,
    outlength = 512,
    alg = 'sha512';


function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
};

function addUser(db, username, password, next) {
    var salt = crypto.randomBytes(32).toString('hex');
    crypto.pbkdf2(password, salt, iters, outlength, alg, (err, key) => {
        if (err) {
            throw err;
        }

        db.run("INSERT INTO USERS(ID,USERNAME,PASSWORD,PSALT,OTPKEY,T0,LH,LH_ITER,LH_SECRET)"
                + " VALUES(?,?,?,?,NULL,NULL,NULL,NULL,NULL)", randomInt(1, 65535), username, key.toString('hex'), salt);
        next();
    });
}

/*
 * Helper to generate OTP key
 */
function genkey() {
    return crypto.randomBytes(16).toString('hex');
}

fs.access(process.env.NODE_PATH + '/src/db/users.db', fs.constants.F_OK, (err) => {
    if (err) {
        var db = new sqlite3.Database(process.env.NODE_PATH + '/src/db/users.db');

        db.run("CREATE TABLE USERS(ID INT PRIMARY KEY NOT NULL,USERNAME TEXT NOT NULL,"
                +"PASSWORD TEXT NOT NULL,PSALT TEXT NOT NULL,OTPKEY TEXT,T0 LONG,LH TEXT,LH_ITER LONG,LH_SECRET TEXT);");

        addUser(db, 'user1', 'foobar',
            addUser.bind(undefined, db, 'user2', 'password1',
                    dbApi.updateOTPKey.bind(undefined, db, 'user1', genkey(),
                        dbApi.updateOTPKey.bind(undefined, db, 'user2', genkey(),
                                function() {
                                    console.log('users.db provisioning complete.');
                                    db.close();
                                }))));
    }
});

module.exports = {
    iters,
    outlength,
    alg
};
