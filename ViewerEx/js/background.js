chrome.browserAction.onClicked.addListener(function(activeTab)
  {
    var newURL = chrome.extension.getURL('gallery.html');
    chrome.tabs.create({ url: newURL });
  }
);