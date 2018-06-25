import React, {Component} from 'react';
import GroupsList from './List';
import RecipientsList from './RecepientsList';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 'list',
      item: ''
    };

    this.changePage = this.changePage.bind(this);
    this.renderPage = this.renderPage.bind(this);
  }

  /**
   * Change page.
   *
   * @param item
   *  If page equals to recipients needs an item.
   */
  changePage(item = '') {
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
    return this.state.page === 'list' ? <GroupsList changePage={this.changePage}/> :
      <RecipientsList item={this.state.item} changePage={this.changePage}/>
  }

  render() {
    return (
      <div>
        {this.renderPage()}
      </div>
    );
  }
}
