import React, { Component } from 'react';
import axios from 'axios';
// import RegCode from './regcode.jsx';

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
        var roles = []
        if (result.data.roles !== undefined)
          for (var i = 0; i < result.data.roles.length; i++) {
            roles.push(result.data.roles[i].target_id);
            if (result.data.roles[i].target_id === 'group_administrator')
              groupAdmin = true;
          }
        var primaryGroup = '';
        if (result.data.field_primary_group[0] !== undefined)
        primaryGroup = result.data.field_primary_group["0"].target_id
        console.log(roles);
        var userDate = new Date(parseInt(result.data.created["0"].value, 10) * 1000);
        self.setState({
          'name': result.data.name["0"].value,
          'email': result.data.mail["0"].value,
          'firstName': result.data.field_first_name["0"].value + ' ',
          'notes': result.data.field_notes["0"].value,
          'surname': result.data.field_surname["0"].value,
          'primaryGroup': primaryGroup,
          'regCode': result.data.field_registration_code.value,
          'groupAdmin': groupAdmin,
          'roles': roles.toLocaleString(),
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
              User Profile : {this.state.firstName + this.state.surname}
            </a>
            <a href="#" className="list-group-item list-group-item-action"><strong>Account:</strong>&nbsp;{this.state.name}</a>
            <a href="#" className="list-group-item list-group-item-action"><strong>Email:</strong>&nbsp;{this.state.email}</a>
            <a href="#" className="list-group-item list-group-item-action"><strong>Date:</strong>&nbsp;{this.state.date}</a>
            <a href="#" className="list-group-item list-group-item-action"><strong>Roles:</strong>&nbsp;{this.state.roles}</a>
            <a href="#" className="list-group-item list-group-item-action"><strong>Registration Code:</strong>&nbsp;{this.state.regCode}</a>
            <a href="#" className="list-group-item list-group-item-action"><strong>Can register users?:</strong>&nbsp;{this.state.groupAdmin}</a>
            <a href="#" className="list-group-item list-group-item-action"><strong>Admin User Group:</strong>&nbsp;{this.state.primaryGroup}</a>
            {/* <a href="#" className="list-group-item list-group-item-action"><strong>Group Admin:</strong>&nbsp;{this.groupAdmin}</a> */}
            {/* <RegCode /> */}
            <div className="row offset-md-2 top-buffer">
              {/* <button type="submit" className="btn btn-primary col-md-4">Change Password</button>&nbsp; */}
              {/* <button type="submit" className="btn btn-primary col-md-4">Change Email</button> */}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Profile
