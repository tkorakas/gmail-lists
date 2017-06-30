import transformToKey from '../utils/StringHelpers';

// Listen for elapsed alarms.
chrome.alarms.onAlarm.addListener((alarm) => {
  chrome.storage.sync.get(['gmail_lists_delete_queue', 'gmail_lists'], (data) => {
    // Set items.
    const queue = data['gmail_lists_delete_queue'] !== undefined ? data['gmail_lists_delete_queue'] : [];
    const items = data['gmail_lists'] !== undefined ? data['gmail_lists'] : [];
    const newItemsList = items.filter(item => !queue.includes(item));

    chrome.storage.sync.set({gmail_lists: newItemsList}, () => {
      chrome.runtime.sendMessage({greeting: "hello"}, () => {
      });

      chrome.storage.sync.set({gmail_lists_delete_queue: []});
    });

    // Delete email lists.
    const cleanedName = transformToKey(e.target.name);
    const storageKey = `gmail_lists_${cleanedName}`;
    chrome.storage.sync.remove(storageKey, () => {
      this.saveToChromeStorage(items);
    });
  });
});
