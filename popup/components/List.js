import React, {Component} from 'react';
import keyIndex from 'react-key-index';
import {CSSTransitionGroup} from 'react-transition-group' // ES6
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
        const items = [...this.state.items, trimmedValue];
        this.saveToChromeStorage(items, true);
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
   * Set items to Chrome storage and update local state.
   *
   * @param items
   *  Array with string items.
   * @param isNewItem
   *  Check if is new item to scroll.
   */
  saveToChromeStorage(items, isNewItem = false) {
    let objectToSave = {};
    objectToSave['gmail_lists'] = items;
    chrome.storage.sync.set(objectToSave, () => {
      this.setState({
        items,
      }, () => {
        if (isNewItem) {
          // Scroll to last item.
          this.list.scrollTop += 30 * (this.state.items.length);
        }
      });
    });
  }

  render() {
    const data = keyIndex(this.state.items, 1);
    return (
      <div className="app-list">
        <span className="input-container">
          <input placeholder='Create new list' onKeyPress={this.addItem} type="text" ref={c => this.text = c}/>
        </span>
        <ul ref={(c) => this.list = c}>
          <CSSTransitionGroup
            transitionName="list-item"
            transitionEnterTimeout={500}
            transitionLeaveTimeout={300}>
            {data.map(item => {
              return (
                <li key={item._id} onClick={() => this.props.changePage(item.value)}>
                  <span title={item.value}>{item.value}</span>
                  <a name={item.value} onClick={this.deleteItem} className="delete-button" href="">&#10005;</a>
                </li>
              );
            })}
          </CSSTransitionGroup>
        </ul>
      </div>
    );
  }
}
