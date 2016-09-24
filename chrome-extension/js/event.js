var clientSecret = "keyboard cat";
var step_time = 60000; // 1 minute

/*
 *   Returns null if the serverCodes didn't match
 */
function getClientCode(serverCode, ipAddress){
  console.log(ipAddress);

  var challenge;

  chrome.storage.sync.get(["serverSecret","t0"], function(items) {
        challenge = generateTOTP(items.serverSecret, items.t0, ipAddress);
  });

  console.log("challenger: " + challenge);
  console.log("serverCode: " + serverCode);

  if (challenge !== serverCode){ return null};

  return generateTOTP(clientSecret,t0)
}


/*
 * produces the HMAC(key,TOTP|IP) code
 * See RFC 6238 and 4226 Section 9
 */
var generateTOTP = function(otpkey,t0,ipAddress) {

   var longIP = '';
   if(ipAddress !== undefined){
       longIP = longFromIP(ipAddress);
   }

   var t = Math.floor((Date.now()-t0)/step_time);
   var input = t.toString() + longIP.toString();

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
   return (ipl >>>0);

};

chrome.extension.onMessage.addListener(
    function(request, sender, callback) {
        var clientCode = getClientCode(request.serverCode,request.ipAddress)

        if (clientCode) {
           return callback(clientCode);
        }

        chrome.browserAction.setIcon({path: '/img/CompassMaterial16_red.png'})
        return callback('do not proceed further');
    }
);

chrome.tabs.onActivated.addListener(function(tabId, changeInfo, tab) {
        chrome.browserAction.setIcon({path: '/img/CompassMaterial16.png'})
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
        chrome.browserAction.setIcon({path: '/img/CompassMaterial16.png'})
});
