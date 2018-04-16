import React, { Component } from 'react';
import axios from 'axios';

class RegCode extends Component {

  constructor(props) {
    super(props);
    this.state = {
      groups: '',
      email: '',
      regcode: ''
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
        for (var i = 0; i < result.data.roles.length; i++) {
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
        <div className="col">
          <form className="col-md-8 offset-md-1 text-center" onSubmit={this.handleSubmit}>
            <div className="form-inline">
              <label htmlFor="userEmail" className="col-sm-4 control-label">Email for New User</label>
              <div className="col-sm-2">
                <input name="userEmail" value={this.state.userEmail} onChange={this.handleChange} required
                  type="text" className="form-control" placeholder="User email e.g. user@example.com" />
              </div>
            </div>
            <div className="form-inline">
              <label htmlFor="registrationCode" className="col-sm-3 control-label">Registration Code</label>
              <div className="col-sm-2">
                <input name="registrationCode" value={this.state.registrationCode} onChange={this.handleChange} required
                  type="text" className="form-control" placeholder="Code issued by trust e.g. GMH-123456" />
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default RegCode
