import React, {Component} from 'react';
import List from './List';
import RecipientsList from './RecepientsList';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 'list',
      item: ''
    };

    this.openDonateButton = this.openDonateButton.bind(this);
    this.openGoogleForm = this.openGoogleForm.bind(this);
    this.changePage = this.changePage.bind(this);
    this.renderPage = this.renderPage.bind(this);
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

  /**
   * Change page.
   *
   * @param page
   *  Page to change to.
   * @param item
   *  If page equals to recipients needs an item.
   */
  changePage(item = '') {
    console.log(item, 'page changed');
    const page = this.state.page === 'list' ? 'recipients' : 'list';

    this.setState({
      page,
      item
    });
  }

  /**
   * Render List or recipients page based on state,
   */
  renderPage() {
    return this.state.page === 'list' ? <List changePage={this.changePage}/> : <RecipientsList item={this.state.item} changePage={this.changePage}/>
  }

  render() {
    return (
      <div>
        {this.renderPage()}
        <div className="donate-section">
          <a onClick={this.openDonateButton} href="">Donate a beer</a>
          <a className="google-form" onClick={this.openGoogleForm} href="">Bug/Feature</a>
        </div>
      </div>
    );
  }
}
