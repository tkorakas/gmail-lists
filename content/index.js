import React, {Component} from 'react';
import keyIndex from 'react-key-index';
import cleanSpecialCharactersAndRemoveSpaces from '../utils/StringHelpers';

export default class Lists extends Component {

  constructor(props) {
    super(props);

    this.state = {
      items: [],
    };
    this.fillRecipients = this.fillRecipients.bind(this);
  }

  componentDidMount() {
    chrome.storage.sync.get({
      keys: 'gmail_lists', callback: (data) => {
        this.setState({
          items: data['gmail_lists'] !== undefined ? data['gmail_lists'] : [],
        })
      }
    });
  }

  fillRecipients(e) {
    e.preventDefault();
    const name = cleanSpecialCharactersAndRemoveSpaces(e.target.name);
    chrome.storage.sync.get({
      keys: `gmail_lists_${name}`, callback: (data) => {
        const emails = data[`gmail_lists_${name}`];
        this.props.event.composeView.setToRecipients(emails !== undefined ? emails : []);
      }
    });
  }

  render() {
    const data = keyIndex(this.state.items, 1);
    return (
      <ul className="gmails-lists-list">
        {data.map(item => <li key={item._id}><a name={item.value} onClick={this.fillRecipients}
                                                            href="">{item.value}</a></li>)}
      </ul>
    );
  }
}
