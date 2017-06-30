import transformToKey from '../utils/StringHelpers';

export default function deleteFunctionality() {
  // Listen for elapsed alarms.
  chrome.storage.sync.get(['gmail_lists_delete_queue', 'gmail_lists'], (data) => {
    // Set items.
    const queue = data['gmail_lists_delete_queue'] !== undefined ? data['gmail_lists_delete_queue'] : [];
    const items = data['gmail_lists'] !== undefined ? data['gmail_lists'] : [];
    const newItemsList = items.filter(item => !queue.includes(item));

    chrome.storage.sync.set({gmail_lists: newItemsList}, () => {
      chrome.storage.sync.set({gmail_lists_delete_queue: []});
    });
  });
}
