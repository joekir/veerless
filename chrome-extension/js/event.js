var clientSecret = "keyboard cat"; // client secret isn't important in this demo
var step_time = 60000; // 1 minute
var serverSecret, t0;

chrome.storage.sync.get(["serverSecret","t0"], items => {
      serverSecret = items.serverSecret;
      t0 = items.t0;
});

/*
 *   Returns null if the serverCodes didn't match
 */
function getClientCode(serverCode, ipAddress){
  var challenge = generateTOTP(serverSecret, t0, ipAddress);
  if (challenge !== serverCode){
    return null;
  }
  return generateTOTP(clientSecret,t0,'');
}

/*
 * produces the HMAC(key,TOTP|IP) code
 * See RFC 6238 and 4226 Section 9
 */
var generateTOTP = function(otpkey,t0,ipAddress) {
   var longIP = '';
   if(ipAddress !== ''){
       longIP = longFromIP(ipAddress);
   }

   var t = Math.floor((Date.now()-t0)/step_time);
   var input = t.toString() + longIP.toString();
   //DEBUG console.log("input: %s, key: %s", input, otpkey);

   var key = sjcl.codec.utf8String.toBits(otpkey);
   var hmac = new sjcl.misc.hmac(key,sjcl.hash.sha256)
   var result = sjcl.codec.hex.fromBits(hmac.mac(input));

   return result.substring(0,6);
};

var longFromIP = function(ipString){
   // This was stolen from an online Gist, I liked how susinct it was
   // https://gist.github.com/monkeym4ster/7eff5843863f2b373a1e/
   // Its hard to improve on that ;)

   var ipl = 0 ;
   ipString.split('.').forEach(function(octet){
        ipl <<=8;
        ipl += parseInt(octet);
   });
   return (ipl >>> 0);

};

chrome.extension.onMessage.addListener(
    function(request, sender, callback) {
        var clientCode = getClientCode(request.serverCode,request.ipAddress);

        if (clientCode) {
           return callback(clientCode);
        }
        chrome.browserAction.setIcon({path: '/img/CompassMaterial16_red.png'})
        return callback('do not proceed further');
});

chrome.tabs.onActivated.addListener(function(tabId, changeInfo, tab) {
        chrome.browserAction.setIcon({path: '/img/CompassMaterial16.png'})
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
        chrome.browserAction.setIcon({path: '/img/CompassMaterial16.png'})
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
        t0 = changes.t0.newValue;
        //DEBUG console.log('t0 changed from %s to %s',changes.t0.oldValue,changes.t0.newValue);
        serverSecret = changes.serverSecret.newValue;
        //DEBUG console.log('serverSecret changed from %s to %s',changes.serverSecret.oldValue,changes.serverSecret.newValue);
});
