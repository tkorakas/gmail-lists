// Listen for elapsed alarms.
chrome.alarms.onAlarm.addListener((alarm) => {
  console.log('received ')
  chrome.runtime.sendMessage({greeting: "hello"}, () => {
    console.log('sent message')
  });
  // chrome.storage.sync.get('gmail_lists_delete_queue', (data) => {
  //
  // });
});
