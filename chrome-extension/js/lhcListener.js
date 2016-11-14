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


if(!chrome.webRequest.onHeadersReceived.hasListener()){
  chrome.webRequest.onHeadersReceived.addListener(details => {
    var parsedLHH = details.responseHeaders.find(x => x.name === 'X-LHH-Secret');
    if (parsedLHH !== undefined){
      lhhIter = details.responseHeaders.find(x => x.name === 'X-LHH-Iter').value;
      lhhSecret = parsedLHH.value;
      //console.log("lhhSecret: %s, lhhIter: %s", lhhSecret, lhhIter);

      var temp_url = new URL(details.url);
      var filt_url = temp_url.origin + "/*";
      console.log("setting lhh for : %s", filt_url);

      // TODO check for dupe!
      chrome.webRequest.onBeforeSendHeaders.addListener(details =>{
        if(lhhIter <= 1)
          throw "Error iterator needs refreshing!!"

        var updatedLH = genHash(lhhSecret,lhhIter);
        //console.log("new LH value:", updatedLH);

        var updatedHeaders = details.requestHeaders.concat({
          name: "X-LHH",
          value: updatedLH
        });
        --lhhIter;

        return {requestHeaders: updatedHeaders};
      }, { urls: [ filt_url ], types : ['main_frame']}, ['blocking','requestHeaders']);
    }
  }, {urls: [ '<all_urls>'], types : ['main_frame']},['responseHeaders']);
}
