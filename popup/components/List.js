import React, { Component } from 'react';
import { CSSTransitionGroup } from 'react-transition-group';
import Input from '@material-ui/core/Input';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';

export default class GroupsList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      showUndoButton: false,
    };
  }

  componentDidMount() {
    this.loadLists();
  }

  /**
   * Load all lists.
   */
  loadLists = () => {
    chrome.storage.sync.get('gmail_lists', (data) => {
      this.setState({
        items: data['gmail_lists'] !== undefined ? data['gmail_lists'] : [],
      });
    });
  }

  /**
   * Add new list.
   */
  addItem = (e) => {
    if (e.key === 'Enter') {
      const trimmedValue = this.text.value.trim();
      // Check if list name already exists.
      if (!this.state.items.includes(trimmedValue) && trimmedValue !== '') {
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
  deleteItem = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Remove item from array and save to chrome storage and update state.
    const itemToDelete = e.target.name;
    const items = this.state.items.filter((item) => item !== e.target.name);

    // Add item on queue for deletion.
    chrome.storage.sync.get('gmail_lists_delete_queue', (data) => {
      let queue = data['gmail_lists_delete_queue'] !== undefined ? data['gmail_lists_delete_queue'] : [];
      queue.push(itemToDelete);
      chrome.storage.sync.set({ gmail_lists_delete_queue: queue }, () => {
        this.setState({ showUndoButton: true, items });
        setTimeout(() => this.setState({ showUndoButton: false }), 4000);
      });
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
  saveToChromeStorage = (items, isNewItem = false) => {
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
  undoDeletedIem = (e) => {
    chrome.storage.sync.get('gmail_lists_delete_queue', (data) => {
      const deleteQueue = data['gmail_lists_delete_queue'] !== undefined ? data['gmail_lists_delete_queue'] : [];
      const item = deleteQueue.pop();
      chrome.storage.sync.set({ gmail_lists_delete_queue: deleteQueue }, () => {
        this.setState({
          showUndoButton: false,
          items: [...this.state.items, item]
        });
      });
    });
  }

  /**
   * Render undo button element.
   */
  renderUndoButton = () => {
    const undoElement = <button className="undo-button" onClick={this.undoDeletedIem}>Undo</button>;
    return !this.state.showUndoButton ? null : undoElement;
  }

  render() {
    return (
      <div className="app-list">
        <span className="input-container">
          <Input inputRef={c => this.text = c} type="text" autoFocus={true} placeholder="Create new list" onKeyPress={this.addItem} />
        </span>
        <List ref={(c) => this.list = c} component="nav">
          {this.state.items.map(item => {
            return (
              <React.Fragment key={item + '_fragment'} >
                <ListItem button key={item} onClick={() => this.props.changePage(item)}>
                  <ListItemText primary={item} title={item} />
                </ListItem>
                <Divider />
              </React.Fragment>
            );
          })}
        </List>
        {/* <CSSTransitionGroup */}
        {/* transitionName="list-item" */}
        {/* transitionEnterTimeout={500} */}
        {/* transitionLeaveTimeout={300}> */}

        {/* </CSSTransitionGroup> */}
        {this.renderUndoButton()}
      </div>
    );
  }
}
