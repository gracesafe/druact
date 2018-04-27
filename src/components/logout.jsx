import React, { Component } from 'react';
import doRequest from "../utils/request";

import {
  Redirect
} from 'react-router-dom';

class Logout extends Component {

  componentWillMount() {
    // doRequest(this, 'https://eas-grist06.aston.ac.uk/user/logout?_format=json', 'post', '', (function (result) {
    doRequest(this, 'https://eas-grist06.aston.ac.uk/user/logout', 'get', '', (function (result) {
      console.log(result);
    }), (function (result) {
      console.log(result);
    }));

    localStorage.removeItem('username');
    localStorage.removeItem('uid');
    localStorage.removeItem('csrf_token');
    localStorage.removeItem('logout_token');
    localStorage.removeItem('auth');
  }

  render() {
    return (
      <Redirect to="/" />
    );
  }
}

export default Logout
