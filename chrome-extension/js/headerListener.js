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

// used to stop a ton of dupe rules being set.
var set = false;

if (!chrome.declarativeWebRequest.onMessage.hasListener()){
  console.log("adding onMessage listener");

  chrome.declarativeWebRequest.onMessage.addListener(details => {
    if (!set && details.url != '' && details.message === stage2 ){
      console.log("%s from [%s]",details.message,details.url);
      //url = (new URL(details.url)).origin
      url = details.url;
      console.log("Initialized url to [%s]",url);
      set = true;

      updateOTP( () => {
        console.log("otp : %s",otp);
        chrome.declarativeWebRequest.onRequest.removeRules(["init"], () => {
          chrome.declarativeWebRequest.onRequest.addRules([successRule(),failRule()], () => {
            console.log("Now listening for 'X-Veerless-Response'");
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

      set = false;
      chrome.declarativeWebRequest.onRequest.removeRules(["success","fail"], () => {
        chrome.declarativeWebRequest.onRequest.addRules([initRule], () => {
          console.log("Reset to listen for 'X-Veerless-Init'");
        });
      });
    }
    else {/* don't care */}
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
