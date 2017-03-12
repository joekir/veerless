var getCurrentIP = function(callback){
  chrome.tabs.query({
    "active": true
  }, tabs => {
    var currentUrl = tabs.filter(x => x.selected === true)[0].url;
    host = new URL(currentUrl).hostname;

    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) {
      return callback(null,host);
    }
    else {
      // Even though we explicitly declare 'dns' in the extension's manifest.json, it seems to not
      // be available in some versions of chrome, yet the install is still successful. So we check again.
      chrome.permissions.contains({permissions: ['dns']}, success => {
        if (!success){
          return callback('There was an issue accessing your chrome.dns API, please enable it to proceed.',null);
        } else {
          chrome.dns.resolve(host, result => {
            return callback(null,result.address);
          });
        }
      });
    }
  })
}
