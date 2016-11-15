/*
  This file handles the listening for Lamport Hash Username Cookie being set,
  it then injects the new lamport hash header each time a request is made to the site.
*/

// Listen for X-LHH-Secret and X-LHH-Iter headers
// We can't use declarativeWebRequest here as we need to read those headers.

var lhhSecret = '';
var lhhIter = 0;

function genHash(seed,i){
  while(i > 0){
    var seed = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(seed))
    i--;
  }
  return seed;
}

/*
 * This horrible inline code allows us to dynamically name the listeners
 * function based on domain. So we can check we check for previous existence
 * and not introduce race conditions.
 */
var namedListener = function(name){
  // Sanitize eval input!!
  if(!name.match('^[a-z0-9\-]+$'))
    throw "Invalid domain name!";

  return new Function(
    "return function " + name + `(details){
      if(lhhIter <= 1){
        // The site will now reject this
        return {requestHeaders : details.requestHeaders};
      }

      var updatedLH = genHash(lhhSecret,lhhIter);
      //console.log('new LH value:', updatedLH);

      var updatedHeaders = details.requestHeaders.concat({
        name: 'X-LHH',
        value: updatedLH
      });
      --lhhIter;

      return {requestHeaders: updatedHeaders};
    }`
  )();
};

if(!chrome.webRequest.onHeadersReceived.hasListener()){
  chrome.webRequest.onHeadersReceived.addListener(details => {
    var parsedLHH = details.responseHeaders.find(x => x.name === 'X-LHH-Secret');
    if (parsedLHH !== undefined){
      lhhIter = details.responseHeaders.find(x => x.name === 'X-LHH-Iter').value;
      lhhSecret = parsedLHH.value;
      //console.log("lhhSecret: %s, lhhIter: %s", lhhSecret, lhhIter);

      var temp_url = new URL(details.url);
      var filt_url = temp_url.origin + "/*";
      var func_name = temp_url.hostname.replace('.','');
      // console.log("setting lhh for : %s", filt_url);
      // console.log("new Listener named [%s] created.", func_name);

      // Only allow one listener per domain.
      if(chrome.webRequest.onBeforeSendHeaders.hasListener(func_name))
        chrome.webRequest.onBeforeSendHeaders.removeListener(func_name);

      chrome.webRequest.onBeforeSendHeaders.addListener(namedListener(func_name)
        , { urls: [ filt_url ], types : ['main_frame']}, ['blocking','requestHeaders']);
    }
  }, {urls: [ '<all_urls>'], types : ['main_frame']},['responseHeaders']);
}
