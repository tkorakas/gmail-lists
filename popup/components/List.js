import React, {Component} from 'react';
import keyIndex from 'react-key-index';
import {CSSTransitionGroup} from 'react-transition-group';
import cleanSpecialCharactersAndRemoveSpaces from '../../utils/StringHelpers';

export default class List extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      showUndoButton: false,
    };

    this.addItem = this.addItem.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
    this.saveToChromeStorage = this.saveToChromeStorage.bind(this);
    this.loadLists = this.loadLists.bind(this);
    this.undoDeletedIem = this.undoDeletedIem.bind(this);
    this.renderUndoButton = this.renderUndoButton.bind(this);
  }

  componentDidMount() {
    return;
    this.loadLists();
    chrome.runtime.onMessage.addListener((request, sender) => {
      this.setState({showUndoButton: false});
      this.loadLists();
    });
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
      if (!this.state.items.includes(trimmedValue) && trimmedValue !== '') {
        // Add new item to array and save to chrome storage and update state.
        const items = [...this.state.items, trimmedValue];
        this.setState({items});
        // this.saveToChromeStorage(items, true);
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
    const itemToDelete = e.target.name;
    const items = this.state.items.filter((item) => item !== e.target.name);
    // const cleanedName = tranformToKey(e.target.name);
    // const storageKey = `gmail_lists_${cleanedName}`;

    // Add item on queue for deletion.
    chrome.storage.sync.get('gmail_lists_delete_queue', (data) => {
      let queue = data['gmail_lists_delete_queue'] !== undefined ? data['gmail_lists_delete_queue'] : [];
      queue.push(itemToDelete);
      chrome.storage.sync.set({gmail_lists_delete_queue: queue}, () => {
        chrome.alarms.create('gmail_lists_delete_item', {when: Date.now() + 4000});
        this.setState({showUndoButton: true, items});
      });
    });

    // remove from background script.
    return;
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

  /**
   * Remove last item from delete queue.
   */
  undoDeletedIem(e) {
    chrome.storage.sync.get('gmail_lists_delete_queue', (data) => {
      const deleteQueue = data['gmail_lists_delete_queue'] !== undefined ? data['gmail_lists_delete_queue'] : [];
      deleteQueue.pop();
      chrome.storage.sync.set({gmail_lists_delete_queue: deleteQueue}, () => {
        this.setState({
          showUndoButton: false,
        });
        this.loadLists();
      });
    });
  }

  renderUndoButton() {
    const undoElement = <button className="undo-button" onClick={this.undoDeletedIem}>Undo</button>;
    return !this.state.showUndoButton ? null : undoElement;
  }

  render() {
    const data = keyIndex(this.state.items, 1);
    return (
      <div className="app-list">
        <span className="input-container">
          <input placeholder="Create new list" onKeyPress={this.addItem} type="text" ref={c => this.text = c}/>
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
        {this.renderUndoButton()}
      </div>
    );
  }
}
