import React, {Component} from 'react';
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
    chrome.storage.sync.get('gmail_lists', (data) => {
      this.setState({
        items: data['gmail_lists'] !== undefined ? data['gmail_lists'] : [],
      })
    });
  }

  fillRecipients(e) {
    e.preventDefault();
    const name = cleanSpecialCharactersAndRemoveSpaces(e.target.name);
    chrome.storage.sync.get(`gmail_lists_${name}`, (data) => {
      const emails = data[`gmail_lists_${name}`];
      this.props.event.composeView.setToRecipients(emails !== undefined ? emails : []);
    });
  }

  render() {
    return (
      <ul className="gmails-lists-list">
        {this.state.items.map(item => <li><a name={item} onClick={this.fillRecipients} href="">{item}</a></li>)}
      </ul>
    );
  }
}
