import React, {Component} from 'react';
import cleanSpecialCharactersAndRemoveSpaces from '../../utils/StringHelpers';

export default class List extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: []
    };

    this.addItem = this.addItem.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
    this.saveToChromeStorage = this.saveToChromeStorage.bind(this);
    this.loadLists = this.loadLists.bind(this);
  }

  componentDidMount() {
    this.loadLists();
  }

  loadLists() {
    chrome.storage.sync.get(this.state.storage, (data) => {
      this.setState({
        items: data[this.state.storage] != undefined ? data[this.state.storage] : [],
      })
    });
  }

  /**
   * Add new list.
   */
  addItem(e) {
    if (e.key == 'Enter') {
      console.log(this.text.value);
      // Check if list name already exists.
      if (!this.state.items.includes(this.text.value)) {
        // Add new item to array and save to chrome storage and update state.
        const items = [...this.state.items, this.text.value];
        this.saveToChromeStorage(items);
      }

      this.text.value = '';
    }
  }

  /**
   * Delete an item from the list.
   */
  deleteItem(e) {
    e.preventDefault();
    e.stopPropagation();
    // Remove item from array and save to chrome storage and update state.
    const items = this.state.items.filter((item) => item != e.target.name);
    // this.saveToChromeStorage(items);
    chrome.storage.sync.remove(`gmails_lists_${e.target.name}`, () => {
      this.setState({
        items
      })
    });
  }

  /**
   * Change to recipients view.
   */
  changeRecipients(e) {
    e.preventDefault();
    const name = e.target.name;
    console.log(e.target.name);
    chrome.storage.sync.get(`gmail_lists_${name}`, (data) => {
      console.log(data);
      this.setState({
        items: data[`gmail_lists_${name}`] != undefined ? data[`gmail_lists_${name}`] : [],
        storage: `gmail_lists_${name}`,
        placeholder: 'Add recipients'
      });
    });
  }

  goBack(e) {
    e.preventDefault();
    this.setState({
      placeholder: 'Add new group',
      storage: 'gmail_lists',
    }, () => this.loadLists());
  }

  /**
   * Set items to chrome storage and update local state.
   *
   * @param items
   *  Array with string items.
   */
  saveToChromeStorage(items) {
    let objectToSave = {};
    objectToSave[this.state.storage] = items;
    chrome.storage.sync.set(objectToSave, () => {
      this.setState({
        items,
      });
    });
  }

  /**
   * Redirect to donate button.
   */
  openDonateButton(e) {
    chrome.tabs.create({url: 'https://www.paypal.me/tkorakas/2'});
  }

  /**
   * Redirect to Google form.
   */
  openGoogleForm(e) {
    chrome.tabs.create({url: 'https://goo.gl/forms/cYNi93wGUe1hDsYt1'});
  }

  render() {
    return (
      <div>
        <span className="input-container">
          <input placeholder='Create new list' onKeyPress={this.addItem} type="text" ref={c => this.text = c}/>
        </span>
        <ul>
          {this.state.items.map(item => {
            return (
              <li onClick={() => this.props.changePage(item)}>
                <span>{item}</span>
                <a name={item} onClick={this.deleteItem} style={{float: 'right'}} href="">&#10005;</a>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}
