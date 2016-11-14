/*
 * Make sure we clean down any remaining rules
 */
chrome.management.onUninstalled.addListener(id => {
  chrome.declarativeWebRequest.onRequest.removeRules();
});

chrome.management.onDisabled.addListener(info => {
  chrome.declarativeWebRequest.onRequest.removeRules();
});
