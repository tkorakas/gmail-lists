import React, { Component } from 'react';
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
    chrome.storage.sync.get(
      'gmail_lists', (data) => {
        this.setState({
          items: data['gmail_lists'] !== undefined ? data['gmail_lists'] : [],
        })
      }
    );
  }

  fillRecipients(item, method) {
    const name = cleanSpecialCharactersAndRemoveSpaces(item);
    chrome.storage.sync.get(`gmail_lists_${name}`, (data) => {
      const emails = data[`gmail_lists_${name}`];
      this.props.event.composeView[method](emails !== undefined ? emails : []);
    }
    );
  }

  render() {
    const data = keyIndex(this.state.items, 1);
    return (
      <ul className="gmails-lists-list">
        {data.map((item) => {
          return (
            <React.Fragment key={item.id}>
              <li key={item.id}>{item.value}
                <a name={item.value} title="Fill 'Bcc' field." onClick={(e) => { e.preventDefault(); this.fillRecipients(e.target.name, 'setBccRecipients') }} href="">Bcc</a>
                <a name={item.value} title="Fill 'Cc' field." onClick={(e) => { e.preventDefault(); this.fillRecipients(e.target.name, 'setCcRecipients') }} href="">Cc</a>
                <a name={item.value} title="Fill 'To' field." onClick={(e) => { e.preventDefault(); this.fillRecipients(e.target.name, 'setToRecipients') }} href="">To</a>
              </li>
              <hr className="gmail-lists-list--divider" />
          </React.Fragment>)
                })}
      </ul>
          );
        }
}
