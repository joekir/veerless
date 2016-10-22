/*
  - Server presents an X-Veerless-Init header to begin the chain
  - The plugin then injects a X-Veerless-Challenge header with its post request
  - The server responds with a X-Veerless-Response: <server OTP code> for the plugin to verify.

  The rule sets here therefore need to be conditional, and reset on failure.
*/

const stage2 = "Enable Response Rule";
const issue = "Issue detected";
const complete = "Done";
var otp = "abcdeb";
var url = '';

var initRule = {
  conditions: [
    new chrome.declarativeWebRequest.RequestMatcher({
      responseHeaders : [{nameEquals: "X-Veerless-Init"}]
    })
  ],
  actions: [
    new chrome.declarativeWebRequest.SendMessageToExtension({ message : stage2 })
  ]
};

var failRule = {
  conditions: [
    new chrome.declarativeWebRequest.RequestMatcher({
      excludeResponseHeaders : [{nameEquals: "X-Veerless-Response", valueEquals: otp }],
      url : { hostPrefix: url}
    })
  ],
  actions: [
    new chrome.declarativeWebRequest.SendMessageToExtension({message : issue })
  ]
};

var successRule = {
  conditions: [
    new chrome.declarativeWebRequest.RequestMatcher({
      responseHeaders : [{nameEquals: "X-Veerless-Response", valueEquals: otp }],
      url : { hostPrefix: url}
    })
  ],
  actions: [
    new chrome.declarativeWebRequest.SendMessageToExtension({message : complete })
  ]
};

if (!chrome.declarativeWebRequest.onMessage.hasListener()){
  console.log("adding onMessage listener");

  chrome.declarativeWebRequest.onMessage.addListener(details => {
    if ('' === url && details.message === stage2){
      console.log("%s from [%s]",details.message,details.url);
      //url = (new URL(details.url)).origin
      url = details.url;
      console.log("initialized url to [%s]",url);
      chrome.declarativeWebRequest.onRequest.removeRules(["initRule"]);
      chrome.declarativeWebRequest.onRequest.addRules([successRule,failRule]);
    }
    else if (details.url === url && details.message !== stage2){
      console.log("%s from [%s]",details.message, details.url);
      chrome.declarativeWebRequest.onRequest.removeRules(["successRule", "failRule"]);
      url = '';
      chrome.declarativeWebRequest.onRequest.addRules([initRule]);
      console.log("reset to initRule, url set back to [%s]",url);
    }
    else {/* don't care */}
  });
}

chrome.declarativeWebRequest.onRequest.getRules(['initRule'], details => {
  if(details.length === 0){
    console.log("adding initRule");
    chrome.declarativeWebRequest.onRequest.addRules([initRule]);
  }
});
