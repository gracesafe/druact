import React, { Component } from 'react';
import axios from 'axios';

import {
  NavLink,
  Redirect
} from 'react-router-dom';
import doRequest from "../utils/request";

class Login extends Component {

  constructor(props) {
    super(props);
    this.state = {
      name: '',
      email: '',
      password: '',
      password2: '',
      sid: '',
      postUrl: 'https://eas-grist06.aston.ac.uk/user/login?_format=json',
      gristUrl: 'https://www.secure.egrist.org/login-headless.php?u=trust-su-drupal&p=delta4force&metaClinID=',
      success: '',
      error: '',
      redirect: false
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    const key = event.target.name;
    const value = event.target.value;

    this.setState({
      [key]: value
    })
  }

  setUserValues(response) {
    // authentication 
    console.log('setting auth values');
    localStorage.setItem('username', response.data.current_user.name);
    localStorage.setItem('uid', response.data.current_user.uid);
    localStorage.setItem('csrf_token', response.data.csrf_token);
    localStorage.setItem('logout_token', response.data.logout_token);
    localStorage.setItem('auth', window.btoa(self.state.name + ':' + self.state.password));

    // roles
    console.log('setting role values');
    if (!(response.data.current_user.roles === undefined))
      for (var i = 0; i < response.data.current_user.roles.length; i++) {
        localStorage.setItem(response.data.current_user.roles[i], true);
      }
    else
      console.log('no role information');

    // groups
    console.log('setting group values');
  }

  handleSubmit1(event) {
    event.preventDefault();
    var self = this;
    var data = { name: this.state.name, pass: this.state.password };
    doRequest(this, 'https://eas-grist06.aston.ac.uk/rest/content/file?_format=json', 'post', data, this.setUserValues, (function (result) {
      // console.log(result);
      self.setState({
        document_body: result
      });
    }));
  }

  handleSubmit(event) {
    event.preventDefault();
    var self = this;
   
    axios.post('https://eas-grist06.aston.ac.uk/user/login?_format=json', {
      name: this.state.name,
      pass: this.state.password
    })
      .then(function (response) {
        self.setState({
          'success': 'Login successful',
          'error': ''
        });

        localStorage.setItem('username', response.data.current_user.name);
        localStorage.setItem('uid', response.data.current_user.uid);
        localStorage.setItem('csrf_token', response.data.csrf_token);
        localStorage.setItem('logout_token', response.data.logout_token);
        localStorage.setItem('auth', window.btoa(self.state.name + ':' + self.state.password));

        if (!(response.data.current_user.roles === undefined))
          for (var i = 0; i < response.data.current_user.roles.length; i++) {
            localStorage.setItem(response.data.current_user.roles[i], true);
          }

        // login to GRiST if the drupal login is successful
        axios.post('https://www.secure.egrist.org/login-headless.php?u=trust-su-drupal&p=delta4force&metaClinID=', 'GET')
          .then(function (response) {
            self.setState({
              'success': 'Login successful',
              'error': ''
            });

            var session = response['data'];
            localStorage.setItem('sid', session);
            console.log(session);

            self.setState({ redirect: true });
          }).catch(function (error) {
            console.log(error);
            self.setState({
              'success': '',
              'error': error
            });
          });
      })
      .catch(function (error) {
        console.log(error);
        var errorResponse = error.message;
        errorResponse = errorResponse.replace(/(?:\r\n|\r|\n)/g, '<br />');
        self.setState({
          'success': '',
          'error': errorResponse
        });
      });
  }
  render() {

    if (this.state.redirect) {
      return (
        <Redirect to="/home" />
      );
    }

    return (
      <div className="row top-buffer">
        <div className="col">
          <form className="col-md-6 offset-md-3 text-center" onSubmit={this.handleSubmit}>
            <div className="form-group">
              <input name="name" value={this.state.name} onChange={this.handleChange} required type="text" className="form-control" placeholder="Enter username" />
            </div>
            <div className="form-group">
              <input name="password" value={this.state.password} onChange={this.handleChange} required type="password" className="form-control" placeholder="Enter password" />
            </div>
            <button type="submit" className="btn btn-primary">Login</button>
            <div className="form-group messages">
              <p className="success">{this.state.success}</p>
              <p className="error" dangerouslySetInnerHTML={{ __html: this.state.error }} />
            </div>
            <NavLink to="/user/register">Don't have an account?</NavLink>
          </form>
        </div>
      </div>
    );
  }
}

export default Login
