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
    var startParam = this.props.location.search.split('=')[1];
    this.state = {
      startMode: startParam,
      clientId: 'testClient1',
      patientName: 'Test Client',
      sourceUrl: '/grace/',
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
    console.log(e);
    var w = document.getElementsByTagName('iframe')[0].contentWindow;
    switch (e) {
      case "1":
        w.GlobalVariables.currentMygraceVersionPathways = w.GlobalVariables.mygraceVersionPathways.MY_LIFE;
        w.LayoutManager.setMindMapLayout({
          currentMindmapMode: w.GlobalVariables.MindMapModes.FULL
        });
        break;
      case "2":
        w.GlobalVariables.currentMygraceVersionPathways = w.GlobalVariables.mygraceVersionPathways.MY_LIFE;
        w.LayoutManager.setMindMapLayout({
          currentMindmapMode: w.GlobalVariables.MindMapModes.FULL
        });
        break;
      case 1:
        w.GlobalVariables.currentMygraceVersionPathways = w.GlobalVariables.mygraceVersionPathways.MY_WELLBEING;
        w.LayoutManager.setupWellBeingAssessment();
        break;
      case 2:
        w.GlobalVariables.currentMygraceVersionPathways = w.GlobalVariables.mygraceVersionPathways.MY_SAFETY;
        w.LayoutManager.setupScreeningOnly();
        break;
      case 5:
        w.GlobalVariables.currentMygraceVersionPathways = w.GlobalVariables.mygraceVersionPathways.MY_WELLBEING;
        w.LayoutManager.setupWellBeingAssessment();
        break;
      default:
        break;
    }    
}

  createUrl() {
    var sid = localStorage.getItem('sid');
    var startParam = this.props.location.search.split(',')[1];

    // var gristURL = 'https://www.secure.egrist.org/panel/mhexperts/mh-dss-assess-light-launch.php?SID=' + sid;
    var gristURL = '/grace/?SID=' + sid;
    // eslint-disable-next-line
    gristURL += '&clinclientid=' + localStorage.getItem('clientId');;
    // eslint-disable-next-line
    gristURL += '&metaPatientName=' + localStorage.getItem('username');;
    // eslint-disable-next-line
    gristURL += '&metaExtendedSettingsJSTool={"startMode":' + startParam + '}';
    //  self.setState({redirect: true});

    console.log(gristURL);

    localStorage.setItem('sourceUrl', gristURL);
    // if (document.getElementsByTagName('iframe').length > 0){

    //   var w = document.getElementsByTagName('iframe')[0].contentWindow;
    //   if (e==1)
    //     w.LayoutManager.setupWellBeingAssessment();
    //     else
    //     w.LayoutManager.setupScreeningOnly();

    //   console.log(w);
    // }

    // <Redirect to="/home" />
  }
  componentDidMount() {
    var sid = localStorage.getItem('sid');
    var startParam = this.props.location.search.split('=')[1];

    // var gristURL = 'https://www.secure.egrist.org/panel/mhexperts/mh-dss-assess-light-launch.php?SID=' + sid;
    var gristURL = '/grace/?SID=' + sid;
    // eslint-disable-next-line
    gristURL += '&clinclientid=' + localStorage.getItem('clientId');;
    // eslint-disable-next-line
    gristURL += '&metaPatientName=' + localStorage.getItem('username');;
    // eslint-disable-next-line
    gristURL += '&metaExtendedSettingsJSTool={"startMode":' + startParam + '}';
    localStorage.setItem('sourceUrl', gristURL);
  }

  render() {
    var gristURL = localStorage.getItem('sourceUrl');
    var startParam = this.props.location.search.split('=')[1];

    console.log(gristURL);
    // var url = localStorage.getItem('sourceUrl');
    // console.log('render');
    // console.log(localStorage.getItem('sourceUrl'));
    // console.log(this.props.location.search);
    return (
      <div className="row">
        <a href='#' onClick={(e) => this.handleClick(1)}>Wellbeing</a><br />
        <a href='#' onClick={(e) => this.handleClick(2)}>Safety</a>
        <iframe name="fGrist" src={gristURL} height='720px' width='85%' className="col" />
        <script>
          var w = document.getElementsByTagName('iframe')[0].contentWindow;
          w.GlobalVariables.currentMygraceVersionPathways = w.GlobalVariables.mygraceVersionPathways.MY_WELLBEING;
          w.LayoutManager.setupWellBeingAssessment();
        </script>
      </div>
    );

    if (document.getElementsByTagName('iframe').length > 0) {

     
    }
  }
}

export default Home
