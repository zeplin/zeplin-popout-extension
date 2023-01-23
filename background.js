chrome.runtime.onMessage.addListener((msg, sender) => {
  // First, validate the message's structure.
  if (msg.from === "content" && msg.subject === "showPageAction") {
    // Enable the page-action for the requesting tab.
    chrome.pageAction.show(sender.tab.id);
  }
});


chrome.runtime.onInstalled.addListener(async () => {
  const cs = chrome.runtime.getManifest().content_scripts[0]

  for (const tab of await chrome.tabs.query({ url: cs.matches })) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: cs.js,
    });
  }
});