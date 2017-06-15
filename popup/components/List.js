import React, {Component} from 'react';
import cleanSpecialCharactersAndRemoveSpaces from '../../utils/StringHelpers';

export default class List extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
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
    chrome.storage.sync.get('gmail_lists', (data) => {
      this.setState({
        items: data['gmail_lists'] !== undefined ? data['gmail_lists'] : [],
      })
    });
  }

  /**
   * Add new list.
   */
  addItem(e) {
    if (e.key === 'Enter') {
      const trimmedValue = this.text.value.trim();
      // Check if list name already exists.
      if (!this.state.items.includes(trimmedValue)) {
        // Add new item to array and save to chrome storage and update state.
        const items = [trimmedValue, ...this.state.items];
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
    const cleanedName = cleanSpecialCharactersAndRemoveSpaces(e.target.name);
    const storageKey = `gmail_lists_${cleanedName}`;
    chrome.storage.sync.remove(storageKey, () => {
      this.saveToChromeStorage(items);
    });
  }

  /**
   * Set items to chrome storage and update local state.
   *
   * @param items
   *  Array with string items.
   */
  saveToChromeStorage(items) {
    let objectToSave = {};
    objectToSave['gmail_lists'] = items;
    chrome.storage.sync.set(objectToSave, () => {
      this.setState({
        items,
      });
    });
  }

  render() {
    return (
      <div className="app-list">
        <span className="input-container">
          <input placeholder='Create new list' onKeyPress={this.addItem} type="text" ref={c => this.text = c}/>
        </span>
        <ul>
          {this.state.items.map(item => {
            return (
              <li onClick={() => this.props.changePage(item)}>
                <span>{item}</span>
                <a name={item} onClick={this.deleteItem} className="delete-button" href="">&#10005;</a>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}
