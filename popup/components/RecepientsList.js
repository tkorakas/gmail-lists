import React, { Component } from 'react';
import cleanSpecialCharactersAndRemoveSpaces from '../../utils/StringHelpers';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import ArrowBack from '@material-ui/icons/ArrowBack';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import DeleteIcon from '@material-ui/icons/Delete';
import Divider from '@material-ui/core/Divider';

const styles = {
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
};

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
      if (!this.state.items.includes(newRecipient) && newRecipient !== '') {
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
    return (
      <div className="app-list">
        <AppBar position="static">
          <Toolbar>
            <IconButton
              style={styles.menuButton}
              aria-label="Back"
              onClick={() => this.props.changePage()}
            >
              <ArrowBack />
            </IconButton>
            <Typography variant="title" color="inherit">
              {this.props.item}
            </Typography>
          </Toolbar>
        </AppBar>

        <Input style={{ marginTop: 8 }} fullWidth={true} inputRef={c => this.text = c} type="text" autoFocus={true} placeholder="Add new recipient" onKeyPress={this.addItem} />

        <List ref={(c) => this.list = c} component="nav">
          {this.state.items.map(item => {
            return (
              <React.Fragment key={item + '_fragment'} >
                <ListItem>
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

      </div>
    );
  }
}
