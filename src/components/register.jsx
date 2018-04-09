import React, { Component } from 'react';
import axios from 'axios';

import {
  NavLink,
  Redirect
} from 'react-router-dom';

class Register extends Component {

  constructor(props) {
    super(props);
    this.state = {
      name: '',
      email: '',
      password: '',
      password2: '',
      registrationCode: '',
      firstName: '',
      lastName: '',
      notes: '',
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

  handleSubmit(event) {
    event.preventDefault();

    var self = this;

    if (this.state.password !== this.state.password2) {
      self.setState({
        'success': '',
        'error': 'Passwords do not match'
      });
      return;
    }

    axios.post('https://eas-grist06.aston.ac.uk/user/register?_format=json', {
      name: [{"value": this.state.name}],
      mail: [{"value": this.state.email}],
      pass: [{"value": this.state.password}],
      lastname: [{"value": this.state.lastName}],
      firstName: [{"value": this.state.firstName}],
      notes: [{"value": this.state.notes}],
      regcode: [{"value": this.state.registrationCode}]
    })
    .then(function (response) {
      self.setState({
        'success': 'Registration successful',
        'error': ''
      });
      self.setState({redirect: true});
    })
    .catch(function (error) {
      var errorResponse = error.message;
      errorResponse = errorResponse.replace(/(?:\r\n|\r|\n)/g, '<br />');
      self.setState({
        'success': '',
        'error': errorResponse
      });
    });
  }

  render(){

    if (this.state.redirect) {
      return (
        <Redirect to="/user/login" />
      );
    }

    return (
      <div className="row top-buffer">
        <div className="col">
          <form className="col-md-12 offset-md-3 text-left" onSubmit={this.handleSubmit}>
            <div className="col-sm-6 list-group-item-success">Account Information</div>
            <div className="form-inline">
              <label htmlFor="name" className="col-sm-2 control-label">Username</label>
              <input name="name" value={this.state.name} onChange={this.handleChange} required type="text" className="form-control" placeholder="Enter username" />
            </div>
            <div className="form-inline">
              <label htmlFor="email" className="col-sm-2 control-label">Email</label>
              <input name="email" value={this.state.email} onChange={this.handleChange} required type="email" className="form-control" placeholder="Enter email" />
            </div>
            <div className="form-inline">
              <label htmlFor="password" className="col-sm-2 control-label">Password</label>
              <input name="password" value={this.state.password} onChange={this.handleChange} required type="password" className="form-control" placeholder="Enter password" />
            </div>
            <div className="form-inline">
              <label htmlFor="password2" className="col-sm-2 control-label">Confirm Password</label>
              <input name="password2" value={this.state.password2} onChange={this.handleChange} required type="password" className="form-control" placeholder="Enter password again" />
            </div>
            <div className="col-sm-6 list-group-item-success">Personal Information</div>
            <div className="form-inline">
              <label htmlFor="firstName" className="col-sm-2 control-label">First name</label>
              <div className="col-sm-4">
                <input name="firstName" value={this.state.firstName} onChange={this.handleChange} required
                  type="text" className="form-control" placeholder="First name" />
              </div>
            </div>
            <div className="form-inline">
              <label htmlFor="lastName" className="col-sm-2 control-label">Surname</label>
              <div className="col-sm-4">
                <input name="lastName" value={this.state.lastName} onChange={this.handleChange} required
                  type="text" className="form-control" placeholder="Last name" />
              </div>
            </div>
            <div className="col-sm-6 list-group-item-success">Registration Information</div>
            <div className="form-inline">
              <label htmlFor="registrationCode" className="col-sm-2 control-label">Code</label>
              <div className="col-sm-4">
                <input name="registrationCode" value={this.state.registrationCode} onChange={this.handleChange} required
                  type="text" className="form-control" placeholder="Code issued by trust e.g. GMH-123456" />
              </div>
            </div>
            <div className="form-inline">
              <labvel htmlFor="notes" className="col-sm-2 control-label">Notes</labvel>
              <div className="col-sm-4">
                <textarea name="notes" onChange={this.handleChange} className="form-control" placeholder="What are your reasons for registration" value={this.state.notes}/>
              </div>
            </div>
            <div className="form-inline">
              <NavLink to="/user/login">Already have an account?</NavLink>
              <button type="submit" className="btn btn-primary">Register</button>
            </div>
            <div className="form-group messages">
              <p className="success">{this.state.success}</p>
              <p className="error" dangerouslySetInnerHTML={{ __html: this.state.error }} />
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default Register
