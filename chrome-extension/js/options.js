/*
  This is just a POC, if it were in production you would not want to
  store this sensitive data in chrome storage.
*/

function save_options() {
  var serverSecret = document.getElementById('serverSecret').value.trim();
  var t0 = document.getElementById('t0').value.trim();
  chrome.storage.sync.set({
    serverSecret: serverSecret,
    t0: t0
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

function restore_options() {
  chrome.storage.sync.get({
    serverSecret: " ",
    t0: " "
  }, function(items) {
    document.getElementById('serverSecret').value = items.serverSecret;
    document.getElementById('t0').value = items.t0;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
