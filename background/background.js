import cleanSpecialCharactersAndRemoveSpaces from '../utils/StringHelpers';

// Listen for elapsed alarms.
chrome.alarms.onAlarm.addListener((alarm) => {
  console.log('received ')
  chrome.storage.sync.get(['gmail_lists_delete_queue', 'gmail_lists'], (data) => {
    // Set items.
    console.log(data);
    const queue = data['gmail_lists_delete_queue'] !== undefined ? data['gmail_lists_delete_queue'] : [];
    const items = data['gmail_lists'] !== undefined ? data['gmail_lists'] : [];
    const newItemsList = items.filter(item => !queue.includes(item));

    chrome.storage.sync.set({gmail_lists: newItemsList}, () => {
      chrome.runtime.sendMessage({greeting: "hello"}, () => {
      });

      chrome.storage.sync.set({gmail_lists_delete_queue: []});
    });

    // Delete email lists.
  });

});
