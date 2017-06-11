import React, {Component} from 'react';

export default class Popup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      storage: 'gmail_lists',
      placeholder: 'Add new group'
    };

    this.addItem = this.addItem.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
    this.saveToChromeStorage = this.saveToChromeStorage.bind(this);
    this.changeRecipients = this.changeRecipients.bind(this);
    this.goBack = this.goBack.bind(this);
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
    // Remove item from array and save to chrome storage and update state.
    const items = this.state.items.filter((item) => item != e.target.name);
    this.saveToChromeStorage(items);
  }

  /**
   * Change to recipients view.
   */
  changeRecipients(e) {
    e.preventDefault();
    const name = e.target.name;
    chrome.storage.sync.get(`gmail_lists_${name}`, (data) => {
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

  render() {
    return (
      <div>
        <div>
          {this.state.placeholder == 'Add recipients' ? <a onClick={this.goBack} href="#">&lt;</a> : null}
          <input placeholder={this.state.placeholder} onKeyPress={this.addItem} type="text" ref={c => this.text = c}/>
        </div>
        <ul>
          {this.state.items.map(item => {
            return (
              <li>
                <a name={item} onClick={this.changeRecipients} href="">{item}</a>
                <a name={item} onClick={this.deleteItem} style={{float: 'right'}} href="">&#10005;</a>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}
