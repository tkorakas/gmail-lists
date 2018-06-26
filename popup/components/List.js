import React, { Component } from 'react';
import Input from '@material-ui/core/Input';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import CloseIcon from '@material-ui/icons/Close';

const options = [
  'Copy',
  'Delete',
];
const ITEM_HEIGHT = 24;

export default class GroupsList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      showUndoButton: false,
      undoItem: null
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
        items: data['gmail_lists'] !== undefined ? data['gmail_lists'] : []
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
  deleteItem = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    // Remove item from array and save to chrome storage and update state.
    const items = this.state.items.filter((i) => i !== item);

    // Add item on queue for deletion.
    chrome.storage.sync.set({ gmail_lists: items }, () => {
      this.setState({ showUndoButton: true, items, undoItem: item });
      setTimeout(() => this.setState({ showUndoButton: false }), 4000);
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
          this.list.scrollTop += 30 * (this.state.items.length);
        }
      });
    });
  }

  /**
   * Remove last item from delete queue.
   */
  undoDeletedIem = (e) => {
    const items = [...this.state.items, this.state.undoItem]
    chrome.storage.sync.set({ gmail_lists: items }, () => {
      this.setState({
        showUndoButton: false,
        items
      });
    });
  }

  handleClose = e => {
    e.preventDefault();
    this.setState({ showUndoButton: false })
  }

  /**
   * Render undo button element.
   */
  renderUndoButton = () => {
    const undoElement = <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      open={this.state.showUndoButton}
      autoHideDuration={6000}
      ContentProps={{
        'aria-describedby': 'message-id',
      }}
      message={<span id="message-id">List deleted</span>}
      action={[
        <Button key="undo" color="secondary" size="small" onClick={this.undoDeletedIem}>
          UNDO
            </Button>,
        <IconButton
          key="close"
          aria-label="Close"
          color="inherit"
          onClick={this.handleClose}
        >
          <CloseIcon />
        </IconButton>,
      ]}
    />
    return !this.state.showUndoButton ? null : undoElement;
  }

  render() {
    const { anchorEl } = this.state;

    return (
      <div className="app-list">
        <span className="input-container">
          <Input fullWidth={true} inputRef={c => this.text = c} type="text" autoFocus={true} placeholder="Create new list" onKeyPress={this.addItem} />
        </span>
        <List ref={(c) => this.list = c} component="nav">
          {this.state.items.map(item => {
            return (
              <React.Fragment key={item + '_fragment'} >
                <ListItem button key={item} onClick={() => this.props.changePage(item)}>
                  <ListItemText primary={item} title={item} />
                  <IconButton
                    className="delete-button"
                    aria-label="More"
                    onClick={(e) => this.deleteItem(e, item)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
                <Divider />
              </React.Fragment>
            );
          })}
        </List>
        {this.renderUndoButton()}
      </div>
    );
  }
}
