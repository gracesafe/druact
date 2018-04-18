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
    this.handleSubmit = this.handleSubmit.bind(this);
    
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
          'groupAdmin': groupAdmin,
          'date': userDate.toISOString()
        });
      })
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
        localStorage.setItem('roles', response.data.roles);

        // // login to GRiST if the drupal login is successful
        // axios.post('https://www.secure.egrist.org/login-headless.php?u=trust-su-drupal&p=delta4force&metaClinID=', 'GET')
        //   .then(function (response) {
        //     self.setState({
        //       'success': 'Login successful',
        //       'error': ''
        //     });

        //     var session = response['data'];
        //     localStorage.setItem('sid', session);
        //     console.log(session);

        //     self.setState({ redirect: true });
        //   }).catch(function (error) {
        //     console.log(error);
        //     self.setState({
        //       'success': '',
        //       'error': error
        //     });
        //   });

        // self.setState({ redirect: true });
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
    if (this.state.groupAdmin){

    
    return (
      <div className="row top-buffer">
        <div className="col">
          <form className="col-md-8 offset-md-2 text-center" onSubmit={this.handleSubmit}>
            <div className="form-inline">
              <label htmlFor="userEmail" className="col-sm-6 control-label">Email for New User</label>
              <div className="col-sm-6">
                <input name="userEmail" value={this.state.userEmail} onChange={this.handleChange} required
                  type="text" className="form-control" placeholder="User email e.g. user@example.com" />
              </div>
            </div>
            <div className="form-inline">
              <label htmlFor="registrationCode" className="col-sm-6 control-label">Registration Code</label>
              <div className="col-sm-6">
                <input name="registrationCode" value={this.state.registrationCode} type="text" className="form-control" placeholder="Code issued by trust e.g. GMH-123456" />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Allocate Registration Code</button>
            <div className="form-group messages">
              <p className="success">{this.state.success}</p>
              <p className="error" dangerouslySetInnerHTML={{ __html: this.state.error }} />
            </div>

          </form>
        </div>
      </div>
    );
  }else {
    return  (
      <div />
    );
  }
  }
}

export default RegCode
