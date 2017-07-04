import transformToKey from '../utils/StringHelpers';

export default function deleteFunctionality() {
  let queue = [];
  chrome.storage.sync.get(['gmail_lists_delete_queue', 'gmail_lists'], (data) => {
    // Set items.
    queue = data['gmail_lists_delete_queue'] !== undefined ? data['gmail_lists_delete_queue'] : [];
    const items = data['gmail_lists'] !== undefined ? data['gmail_lists'] : [];
    const newItemsList = items.filter(item => !queue.includes(item));

    chrome.storage.sync.set({gmail_lists: newItemsList}, () => {
      chrome.storage.sync.set({gmail_lists_delete_queue: []});
    });
  });

  // Delete email lists.
  const keysForDeletion = queue.map((item) => {
    const cleanedName = transformToKey(item);
    return `gmail_lists_${cleanedName}`;
  });

  chrome.storage.sync.remove(keysForDeletion);
}
