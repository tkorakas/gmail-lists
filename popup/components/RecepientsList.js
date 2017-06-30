import React, {Component} from 'react';
import keyIndex from 'react-key-index';
import {CSSTransitionGroup} from 'react-transition-group';
import cleanSpecialCharactersAndRemoveSpaces from '../../utils/StringHelpers';

export default class RecipientsList extends Component {
  constructor(props) {
    super(props);
    const item = cleanSpecialCharactersAndRemoveSpaces(this.props.item);
    const storageKey = `gmail_lists_${item}`;
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
    chrome.storage.sync.get(this.state.storageKey, (data) => {
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
      const newRecipient = this.text.value.trim();

      // Check if list name already exists.
      if (!this.state.items.includes(newRecipient)) {
        // Add new item to array and save to chrome storage and update state.
        const items = [...this.state.items, newRecipient];
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
    this.saveToChromeStorage(items);
  }

  /**
   * Set items to chrome storage and update local state.
   *
   * @param items
   *  Array with string items.
   * @param isNewItem
   *  Check if is new item to scroll.
   */
  saveToChromeStorage(items, isNewItem = false) {
    let objectToSave = {};
    objectToSave[this.state.storageKey] = items;
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
        <a onClick={() => this.props.changePage()} href="#" className="back-button">&lt;</a>
        <span className="input-container">
          <input className="recipients-input" placeholder="Add new recipient" onKeyPress={this.addItem} type="text"
                 ref={c => this.text = c}/>
        </span>
        <ul ref={(c) => this.list = c}>
          <CSSTransitionGroup
            transitionName="list-item"
            transitionEnterTimeout={500}
            transitionLeaveTimeout={300}>
            {data.map(item => {
              return (
                <li className="show" key={item._id}>
                  <span title={item.value}>{item.value}</span>
                  <a className="delete-button" name={item.value} onClick={this.deleteItem} style={{float: 'right'}}
                     href="">&#10005;</a>
                </li>
              );
            })}
          </CSSTransitionGroup>
        </ul>
      </div>
    );
  }
}
