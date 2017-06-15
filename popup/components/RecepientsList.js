import React, {Component} from 'react';
import cleanSpecialCharactersAndRemoveSpaces from '../../utils/StringHelpers';

export default class RecipientsList extends Component {
  constructor(props) {
    super(props);
    console.log(this.props.item, 'before');
    const item = cleanSpecialCharactersAndRemoveSpaces(this.props.item);
    console.log(item, 'after');


    const storageKey = `gmail_lists_${item}`;
    console.log(storageKey, 'storageKey');

    console.log(storageKey);
    this.state = {
      items: [],
      storageKey,
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
    console.log(this.state.storageKey)
    chrome.storage.sync.get(this.state.storageKey, (data) => {
      console.log(data);
      this.setState({
        items: data[this.state.storageKey] !== undefined ? data[this.state.storageKey] : [],
      })
    });
  }

  /**
   * Add new list.
   */
  addItem(e) {
    if (e.key === 'Enter') {
      console.log(this.text.value);
      const newRecipient = this.text.value.trim();

      // Check if list name already exists.
      if (!this.state.items.includes(newRecipient)) {
        // Add new item to array and save to chrome storage and update state.
        const items = [...this.state.items, newRecipient];
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
    const items = this.state.items.filter((item) => item !== e.target.name);
    this.saveToChromeStorage(items);
  }

  /**
   * Set items to chrome storage and update local state.
   *
   * @param items
   *  Array with string items.
   */
  saveToChromeStorage(items) {
    let objectToSave = {};
    objectToSave[this.state.storageKey] = items;
    chrome.storage.sync.set(objectToSave, () => {
      this.setState({
        items,
      });
    });
  }

  render() {
    return (
      <div>
        <a onClick={() => this.props.changePage()} href="#" className="back-button">&lt;</a>
        <span className="input-container">
          <input placeholder={this.state.placeholder} onKeyPress={this.addItem} type="email" ref={c => this.text = c} />
        </span>
        <ul>
          {this.state.items.map(item => {
            return (
              <li>
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
