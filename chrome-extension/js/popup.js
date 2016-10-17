function checkServerCode() {
  event.preventDefault();

  var serverCode = document.getElementById("servercode").value;

  chrome.tabs.query({
    "currentWindow": true,
    "status": "complete",
    "active": true,
    "windowType": "normal"
  }, tabs => {
    for (tab in tabs) {
      var currentUrl = tabs[tab].url;
      var host = new URL(currentUrl).hostname;

      if(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host))
      sendMessage(serverCode, host);
      else {
        // Even though we explicitly declare 'dns' in the extension's manifest.json, it seems to not
        // be available in some versions of chrome, yet the install is still successful. So we check again.
        chrome.permissions.contains({permissions: ['dns']}, success => {
          if (!success){
            alert('There was an issue accessing your chrome.dns API, please enable it to proceed.');
          } else {
            chrome.dns.resolve(host, result => {
              sendMessage(serverCode, result.address);
            });
          }
        });
      }
    }
  });
}

function sendMessage(serverCode, ipAddress) {
    chrome.extension.sendMessage({
        "serverCode": serverCode,
        "ipAddress": ipAddress
    }, response => {
        if (chrome.runtime.lastError) {
            console.log(chrome.runtime.lastError);
        } else {
            var c = document.getElementById("clientCode");
            var ctx = c.getContext("2d");

            // Clear just in case we already generated one
            ctx.clearRect(0, 0, c.width, c.height);

            ctx.font = "50px Arial,sans-serif";
            ctx.textBaseline = "alphabetic";
            ctx.fillText(response, 0, 70);
        }
    });
};

window.onload = function() {
    document.getElementById('checkServerCode').addEventListener('submit', checkServerCode);
}
