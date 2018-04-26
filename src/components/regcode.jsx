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
    this.handleSubmit = this.handleSubmit.bind(this);

  }

  componentDidMount() {
    var uid = localStorage.getItem('uid');
    var auth = localStorage.getItem('auth');
    // var pass = localStorage.getItem('pass');
    // var user = localStorage.getItem('uid');
    var self = this;
    var isAdmin = false;
    var gid = -1;

    this.serverRequest = axios.get('/user/' + uid + '?_format=json', {
      headers: { "Authorization": "Basic " + auth }
    })
      .then(function (result) {
        console.log(result);
        for (var i = 0; i < result.data.roles.length; i++) {
          if (result.data.roles[i].target_id === 'group_administrator') {
            isAdmin = true;
            gid = result.data.field_primary_group[0].target_id;
            // primaryGroupName = result.data.field_primary_group[0].target_id;
            this.setState({'group_id': result.data.field_primary_group[0].target_id});
            // gid = result.data.field_primary_group[0].target_id;

          }
        }
        var userDate = new Date(parseInt(result.data.created["0"].value, 10) * 1000);
        self.setState({
          'name': result.data.name["0"].value,
          'email': result.data.mail["0"].value,
          'isAdmin': isAdmin,
          'date': userDate.toISOString()
        });
        // localStorage.setItem('group_named', result.data.field_primary_group[0].target_id);
        self.serverRequest = axios.get('/group/' + gid + '?_format=json', {
          headers: { "Authorization": "Basic " + auth }
        })
          .then(function (result1) {
            console.log(result1);
            self.setState({'group_name': result1.data.label[0].value});

          })

      })
  }

  handleSubmit(event) {
    event.preventDefault();
    
    var self = this;
    self.setState({registrationCode: 'default'});
    // this.state.registrationCode = 'AAA111';

    // axios.post('/entity/registration_code?_format=json', {
    axios.post('https://eas-grist06.aston.ac.uk/node?_format=json', {
      name: this.state.name,
      title: this.state.registrationCode,
      field_created_by: this.state.name,
      field_email: this.state.userEmail,
      field_registration_code: this.state.registrationCode,
      pass: this.state.password,
      auth: localStorage.getItem('auth'), 
      type: {
        'target_id': 'registration_code'
      },
    })
      .then(function (response) {
        self.setState({
          'success': 'Registration Code created',
          'error': ''
        });
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

  handleChange(event) {
    const key = event.target.name;
    const value = event.target.value;
    
    this.textCode.value = Math.floor(Math.random() * (999)); // 3 numbers 
    this.setState({
      [key]: value
    })
  }

  copyToClipboard = (e) => {
    this.textCode.select();
    document.execCommand('copy');
    // This is just personal preference.
    // I prefer to not show the the whole text area selected.
    e.target.focus();
    this.setState({ copySuccess: 'Copied!' });
  };

  render() {
    if (this.state.isAdmin || true) {
      var groupName = localStorage.getItem('group_name');
      return (
        <div className="row top-buffer">
          <div className="col">
            <form className="col-md-8 offset-md-2 text-center" onSubmit={this.handleSubmit}>
              <div className="row text-center" value={groupName}><h1>New user in {groupName}</h1><br /></div>
              <div className="row text-left" value={groupName}><h6>Once you have entered the email address for the new account click <strong>'Allocate Code'.</strong>
                A registration code will be created and allocated to the email address. The code can only be used to create an account with the <italic>given email address</italic>.<br />
                You can send a system email to the user with the registration code by clicking <strong>'Send Email'</strong> below. <br />
                The user will be added to the <strong>{groupName}</strong> group once registered.
                The copy icon will copy the registration code to your system clipboard.</h6><br />
                <h3>Please send the registration code to the user to create a new account.</h3></div>
              <div className="form-inline">
                <label htmlFor="userEmail" className="col-sm-6 control-label">User Email</label>
                <div className="col-sm-6">
                  <input name="userEmail" value={this.state.userEmail} onChange={this.handleChange} required
                    type="text" className="form-control" placeholder="User email (user@example.com)" />
                </div>
              </div>
              <div className="form-inline">
                <label htmlFor="registrationCode" className="col-sm-6 control-label disabled">Registration Code</label>
                <div className="col-sm-6">
                  <input name="registrationCode" ref={(textCode) => this.textCode = textCode} type="text" className="form-control" placeholder="Code issued by trust e.g. GMH-123456" 
                  value={this.state.registrationCode} onChange={this.handleChange} />
                  {
                    /* Logical shortcut for only displaying the 
                       button if the copy command exists */
                    document.queryCommandSupported('copy') &&
                    <div>
                      <i className="fa fa-copy" onClick={this.copyToClipboard}></i>
                      {this.state.copySuccess}
                    </div>
                  }
                </div>
              </div>
              <button type="submit" className="btn btn-primary">Allocate Code</button>&nbsp;&nbsp;
              <button type="submit" className="btn btn-primary disabled">Send Email</button>
              <div className="form-group messages">
                <p className="success">{this.state.success}</p>
                <p className="error" dangerouslySetInnerHTML={{ __html: this.state.error }} />
              </div>

            </form>
          </div>
        </div>
      );
    } else {
      return (
        <div />
      );
    }
  }
}

export default RegCode
