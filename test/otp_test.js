const assert = require('chai').assert;

const otp = require('../src/otp');

describe('otp', function() {
  describe('getServerCode(username,done)', function() {
    it('should return a character hex string', function() {
        otp.getServerCode('Joe', function(err,servercode){
          console.log("server code returned was: " + servercode);
          assert.isString(servercode);
          assert.lengthOf(servercode,6);
        });
    });
  });
});

