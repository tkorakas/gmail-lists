import ReactDOM from 'react-dom';
import React from 'react';
import Content from './index';
import appID from './AppId'

InboxSDK.load('1', appID).then(function (sdk) {
    // The SDK has been loaded.
    sdk.Compose.registerComposeViewHandler(function (composeView) {
        // A compose view has come into existence.
        composeView.addButton({
            title: "Add recipients",
            iconUrl: chrome.runtime.getURL('assets/add_friends.png'),
            hasDropdown: true,
            onClick: function (event) {
                event.dropdown.el.innerHTML = "<div id='gmail_lists_content'> </div>";
                ReactDOM.render(<Content event={event}/>, document.getElementById('gmail_lists_content'));
            },
        });
    });
});