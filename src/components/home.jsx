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

class Home extends Component {

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
    <Redirect to="/question" />
  }
  render() {
    return (
      <div className="row top-buffer">
        <div className="row">
          <div className="list-group col-md-4">
            <h4 className="card-title col-md-4">New Assessment</h4>
            <ul className="list-group">
              <li className="list-group-item list-group-item-success button">
                <button onClick={(e) => this.handleClick(1)} className="list-group-item list-group-item-info">My state of mind</button>
              </li>
              <li className="list-group-item list-group-item-info">
                <button onClick={(e) => this.handleClick(2)} className="list-group-item list-group-item-success">What's happening in my life right now</button>
              </li>
              <li className="list-group-item list-group-item-success">
                <button onClick={(e) => this.handleClick(3)} className="list-group-item list-group-item-info">What my health is like today</button>
              </li>
              <li className="list-group-item list-group-item-info">
                <button onClick={(e) => this.handleClick(4)} className="list-group-item list-group-item-success">My safety</button>
              </li>
              <li className="list-group-item list-group-item-success">
                <button onClick={(e) => this.handleClick(5)} className="list-group-item list-group-item-info">My wellbeing</button>
              </li>
              <li className="list-group-item list-group-item-info">
                <button onClick={(e) => this.handleClick(6)} className="list-group-item list-group-item-success">Overview of everything: past and present</button>
              </li>
            </ul>
            <h4 className="card-title">My Profile</h4>
            <ul className="list-group">
              <li className="list-group-item list-group-item-success">
                <button onClick={(e) => this.handleClick(7)} className="list-group-item list-group-item-info">My personal details</button>
              </li>
              <li className="list-group-item list-group-item-info">
                <button onClick={(e) => this.handleClick(8)} className="list-group-item list-group-item-success">My life journey</button>
              </li>
              <li className="list-group-item list-group-item-success">
                <button onClick={(e) => this.handleClick(9)} className="list-group-item list-group-item-info">My health and care</button>
              </li>
              <li className="list-group-item list-group-item-info">
                <button onClick={(e) => this.handleClick(10)} className="list-group-item list-group-item-success">My involvement with life and others</button>
              </li>
              <li className="list-group-item list-group-item-success">
                <button onClick={(e) => this.handleClick(11)} className="list-group-item list-group-item-info">My personality and way of thinking</button>
              </li>
            </ul>
          </div>
          {/* <input name="qno" value={this.state.name} onChange={this.handleChange} type="text" className="form-control" placeholder="question" /> */}
          <iframe name="fGrist" src={localStorage.getItem('sourceUrl')} height='500px' width='100%' className="col-md-8"/>
        </div>
      </div>
    );
  }
}

export default Home
