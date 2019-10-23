
chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('gallery.html', {
    innerBounds: {
      width: 1440, minWidth: 150, maxWidth: 2880,
      height: 960, minHeight: 100, maxHeight: 1920
    }
  });
});