import React from 'react';
import moment from 'moment';
import Cookies from 'js-cookie';
import GalleryContainer from './GalleryContainer.js';
import AppNavbar from './AppNavbar.js';
import LoginForm from './LoginForm.js';


export default class App extends React.Component {
  constructor() {
    super();
    this.setDate = this.setDate.bind(this);
    this.switchAutoUpdate = this.switchAutoUpdate.bind(this);
    this.setAuthResult = this.setAuthResult.bind(this);

    this.state = { date: moment().format('YYYY-MM-DD'), authResult: '', autoUpdate: true };
  }

  setDate(date) {
    this.setState({ date: date.format('YYYY-MM-DD') });
  }

  switchAutoUpdate() {
    this.setState({ autoUpdate: !this.state.autoUpdate }, () => {
      console.log(this.state.autoUpdate);
    });
  }

  setAuthResult(result) {
    this.setState({ authResult: result });
  }

  render() {

    const isExistToken = (Cookies.get('token') !== undefined) ? true : false;

    return (
      <div className="app">
        <AppNavbar callBacks={{ setDate: this.setDate, switchAutoUpdate: this.switchAutoUpdate }} isExistToken={isExistToken} autoUpdate={this.state.autoUpdate} />
        {!isExistToken ? (
          <LoginForm callBack={this.setAuthResult} />
        ) : (
            <GalleryContainer date={this.state.date} autoUpdate={this.state.autoUpdate} />
          )}
      </div>
    );
  }
};
