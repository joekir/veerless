const sqlite3 = require('sqlite3'),
    process = require('process');

var updateOTPKey = function(db, username, otpkey, next) {
    db.run("UPDATE USERS SET OTPKEY = ?, T0 = ? WHERE USERNAME = ?", otpkey, Date.now(), username);
    return next();
};

/*
 * By design password should not be checked here
 */
var fetchServerCode = function(username, done) {
    var db = new sqlite3.Database(process.env.NODE_PATH + '/src/db/users.db');

    db.get("SELECT OTPKEY,T0 FROM USERS WHERE USERNAME = ?", username,
        function(err, row) {
            if (err) {
                return done(err, null, null);
            } else if (row[Object.keys(row)[0]] === null) {
                return done(new Error('name not found'), null, null);
            } else {
                return done(null, row.OTPKEY, row.T0);
            }
        }
    );
    db.close();
};

var getPassHash = function(username, done) {
    var db = new sqlite3.Database(process.env.NODE_PATH + '/src/db/users.db');

    db.get("SELECT PASSWORD,PSALT FROM USERS WHERE USERNAME = ?", username,
        function(err, row) {
            if (err) {
                return done(err, null, null);
            } else if (row[Object.keys(row)[0]] === null) {
                return done(new Error('name not found'), null, null);
            } else {
                return done(null, row.PASSWORD, row.PSALT);
            }
        }
    );
    db.close();
};

module.exports = {
    fetchServerCode,
    updateOTPKey,
    getPassHash
};
