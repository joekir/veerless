/*
  - Server presents an X-Veerless-Init header to begin the chain
  - The server responds with a X-Veerless-Response: <server OTP code> for the plugin to verify.

  The rule sets here therefore need to be conditional, and reset on failure.
*/

const stage2 = "Enable Response Rule";
const issue = "Issue detected";
const complete = "Done";
var otp = '';
var url = '';

function updateOTP(cb) {
  getCurrentIP( (err,ip) => {
    if (err) {
      alert(err);
      return;
    }

    otp = generateTOTP(serverSecret,t0, ip);
    cb();
  })
};

var initRule = {
  id : "init",
  conditions: [
    new chrome.declarativeWebRequest.RequestMatcher({
      responseHeaders : [{nameEquals: "X-Veerless-Init"}]
    })
  ],
  actions: [
    new chrome.declarativeWebRequest.SendMessageToExtension({ message : stage2 })
  ]
};

// NOTE - to parameterize these, they must be functions, otherwise the values will not be updated!
function failRule () {
  return {
    id : "fail",
    conditions: [
      new chrome.declarativeWebRequest.RequestMatcher({
        "excludeResponseHeaders" : [{ "nameEquals" : "X-Veerless-Response" , "valueEquals": otp }],
        "url" : { "urlEquals": url},
        "stages" : ["onHeadersReceived"]
      })
    ],
    actions: [
      new chrome.declarativeWebRequest.CancelRequest(),
      new chrome.declarativeWebRequest.SendMessageToExtension({ message : issue })
    ]
  };
}

//new chrome.declarativeWebRequest.SendMessageToExtension({ message : issue })

function successRule () {
  return {
    id : "success",
    conditions: [
      new chrome.declarativeWebRequest.RequestMatcher({
        "responseHeaders" : [{ "nameEquals" : "X-Veerless-Response", "valueEquals": otp }],
        "url" : { "urlEquals": url},
        "stages" : ["onHeadersReceived"]
      })
    ],
    actions: [
      new chrome.declarativeWebRequest.SendMessageToExtension({ message : complete })
    ]
  };
}

if (!chrome.declarativeWebRequest.onMessage.hasListener()){
  console.log("adding onMessage listener");

  chrome.declarativeWebRequest.onMessage.addListener(details => {
    if (details.url != '' && details.message === stage2 ){
      console.log("%s from [%s]",details.message,details.url);
      
      url = details.url;
      console.log("Initialized url to [%s]",url);

      updateOTP(() => {
        console.log("otp : %s",otp);
        chrome.declarativeWebRequest.onRequest.removeRules(["init"], () => {
          // Currently the rules aren't parameteriezed with the otp
          // It will error if you try to add an already existing rule, that has not been consumed
          // hence we aggressively clean it
          chrome.declarativeWebRequest.onRequest.removeRules(['success','fail'], () => {
            chrome.declarativeWebRequest.onRequest.addRules([successRule(),failRule()], () => {
              console.log("Now expecting a 'X-Veerless-Response' of %s from %s",otp,url);
            });
          });
        })
      });
    }
    else if (details.url === url && details.message !== stage2){
      console.log("%s from [%s]",details.message, details.url);

      if (details.message === complete){
        chrome.notifications.create({
          "type"  : "basic",
          "iconUrl" : "/img/CompassMaterial32.png",
          "title" : "Server Verified",
          "message" : "2FA client code: " + generateTOTP(clientSecret,t0,'')
        });
      }

      if (details.message === issue){
        chrome.notifications.create({
          "type"  : "basic",
          "iconUrl" : "/img/CompassMaterial32_red.png",
          "title" : "Untrusted - Blocked",
          "message" : "Veerless could not verify this server, it is likely it is untrustworthy. \n\n" +
                      "Please check that you have entered the correct username."
        });
      }

      console.log("Clearing all rules.");
      chrome.declarativeWebRequest.onRequest.removeRules();
      console.log("Reset to listen for 'X-Veerless-Init'");
      chrome.declarativeWebRequest.onRequest.addRules([initRule]);
    }
    else { console.log("Unexpected error"); }
  });
}

chrome.declarativeWebRequest.onRequest.getRules(['init'], details => {
  if(details.length === 0){
    console.log("adding initRule");
    chrome.declarativeWebRequest.onRequest.addRules([initRule]);
  }
});

/*
 * Make sure we clean down any remaining rules
 */
chrome.management.onUninstalled.addListener(id => {
  chrome.declarativeWebRequest.onRequest.removeRules();
});

chrome.management.onDisabled.addListener(info => {
  chrome.declarativeWebRequest.onRequest.removeRules();
});
