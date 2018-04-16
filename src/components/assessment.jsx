/**
 * @author Aman Soni
 * # Purpose
 * Presents assesment sections for user to select questions to answer.
 * Uses an iframe to display data from the existing myGrace assessment form.
 * 
 * # TODO 
 * Config setting for urls
 * 
 * # Changes
 * 
 */

import React, { Component } from "react";
import _ from "lodash";
// import { setMode } from "./action"; 


import {
  NavLink,
  Redirect
} from 'react-router-dom';

class Assessment extends Component {

  constructor(props) {
    super(props);
    this.state = {
      startMode: '1',
      clientId: 'testClient1',
      patientName: 'Test Client',
      sourceUrl: 'https://www.secure.egrist.org/panel/mhexperts/mh-dss-assess-light-launch.php',
      redirect: false
    }
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

    // axios.post('https://eas-grist06.aston.ac.uk/user/register?_format=json', {
    //   name: [{ "value": this.state.name }],
    //   mail: [{ "value": this.state.email }],
    //   pass: [{ "value": this.state.password }],
    //   lastname: [{ "value": this.state.lastName }],
    //   firstName: [{ "value": this.state.firstName }],
    //   notes: [{ "value": this.state.notes }],
    //   regcode: [{ "value": this.state.registrationCode }]
    // })
    //   .then(function (response) {
    //     self.setState({
    //       'success': 'Registration successful',
    //       'error': ''
    //     });
    //     self.setState({ redirect: true });
    //   })
    //   .catch(function (error) {
    //     var errorResponse = error.response.data.message;
    //     errorResponse = errorResponse.replace(/(?:\r\n|\r|\n)/g, '<br />');
    //     self.setState({
    //       'success': '',
    //       'error': errorResponse
    //     });
    //   });
  }

  handleClick(e) {
    console.log('event new');
    console.log(e);
    localStorage.setItem('startMode', e);

    var sid = localStorage.getItem('sid');

    var gristURL = 'https://www.secure.egrist.org/panel/mhexperts/mh-dss-assess-light-launch.php?SID=' + sid;
    // eslint-disable-next-line
    gristURL += '&clinclientid=' + localStorage.getItem('clientId');;
    // eslint-disable-next-line
    gristURL += '&metaPatientName=' + localStorage.getItem('username');;
    // eslint-disable-next-line
    gristURL += '&metaExtendedSettingsJSTool={"startMode":' + e + '}';
    //  self.setState({redirect: true});

    console.log(gristURL);

    localStorage.setItem('sourceUrl', gristURL);
    localStorage.setItem('redirect', true);
    <Redirect to="/home" />
  }
  render() {
    console.log(this.props.location.search);
    return (
      <div className="row">
        <iframe name="fGrist" src={localStorage.getItem('sourceUrl')} height='720px' width='85%' className="col" />
      </div>
    );
  }
}

export default Assessment
