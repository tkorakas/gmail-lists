import React, {Component} from 'react';
export default class Lists extends Component {

  constructor(props) {
    super(props);

    this.state = {
      items: [],
    };
    this.fillRecipients = this.fillRecipients.bind(this);
  }

  renderLists() {
    const lists = localStorage.getItem('gmail_lists');
    console.log(lists);
  }

  componentDidMount() {
    chrome.storage.sync.get('gmail_lists', (data) => {
      this.setState({
        items: data['gmail_lists'] != undefined ? data['gmail_lists'] : [],
      })
    });
  }

  fillRecipients(e) {
    e.preventDefault();
    const name = e.target.name;
    chrome.storage.sync.get(`gmail_lists_${name}`, (data) => {
      this.props.event.composeView.setToRecipients(data[`gmail_lists_${name}`]);
    });
  }

  render() {
    return (
      <ul>
        {this.state.items.map(item => <li><a name={item} onClick={this.fillRecipients} href="">{item}</a></li>)}
      </ul>
    );
  }
}
