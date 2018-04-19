import React, { Component } from 'react';
import axios from 'axios';
import RegCode from './regcode.jsx';

class Profile extends Component {

  constructor(props) {
    super(props);
    this.state = {
      name: '',
      email: '',
      date: ''
    }
  }

  componentDidMount() {
    var uid = localStorage.getItem('uid');
    var auth = localStorage.getItem('auth');
    var self = this;
    this.serverRequest = axios.get('https://eas-grist06.aston.ac.uk/user/' + uid + '?_format=json', {
      headers: { "Authorization": "Basic " + auth }
    })
      .then(function (result) {
        console.log(result);
        var groupAdmin = false;
        for (var i=0; i < result.data.roles.length; i ++) {
          if (result.data.roles[i].target_id === 'group_administrator')
            groupAdmin = true;
        }
        var userDate = new Date(parseInt(result.data.created["0"].value, 10) * 1000);
        self.setState({
          'name': result.data.name["0"].value,
          'email': result.data.mail["0"].value,
          'group-admin': groupAdmin,
          'date': userDate.toISOString()
        });
      })
  }

  render() {
    return (
      <div className="row top-buffer">
        <div className="col-md-8 offset-md-2">
          <div className="list-group">
            <a href="#" className="list-group-item list-group-item-action list-group-item-success">
              User Profile
            </a>
            <a href="#" className="list-group-item list-group-item-action"><strong>Username:</strong>&nbsp;{this.state.name}</a>
            <a href="#" className="list-group-item list-group-item-action"><strong>Email:</strong>&nbsp;{this.state.email}</a>
            <a href="#" className="list-group-item list-group-item-action"><strong>Date:</strong>&nbsp;{this.state.date}</a>
            <a href="#" className="list-group-item list-group-item-action"><strong>Group Admin:</strong>&nbsp;{this.groupAdmin}</a>
            {/* <RegCode /> */}
          </div>
        </div>
      </div>
    );
  }
}

export default Profile
