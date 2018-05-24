import React, { Component } from 'react';

import {
  BrowserRouter as Router,
  Route,
  browserHistory
} from 'react-router-dom';

import Navbar from './components/navbar.jsx';
// import GraceMenu from './components/graceMenu.jsx';
// import Footer from './components/footer.jsx';

import Home from './components/home.jsx';
import Articles from './components/articles.jsx';
import Documents from './components/documents.jsx';
import About from './components/about.jsx';
import Contact from './components/contact.jsx';
import Register from './components/register.jsx';
import Login from './components/login.jsx';
import Profile from './components/profile.jsx';
import Logout from './components/logout.jsx';
import Assessment from './components/assessment.jsx';
import BrowserUtil from './components/research.jsx';
import RegCode from './components/regcode.jsx';
import GraceMenu from './components/graceMenu.jsx';
import Group from './components/group';
import News from './components/news';// import Page from './utils/page';
import Timeline from './components/timeline';
// import Page from './utils/page';
// import Config from './config';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      "username" : localStorage.getItem('username')
      // config: File.open('./config') localStorage.getItem('username')
    };
  }

  init(){

  }

  render() {
    return (
      <Router history={browserHistory}>
        <div className="container">
          <Navbar />
          <GraceMenu />
          <Route path="/group" component={Group} />
          <Route path="/news" component={News} />
          <Route path="/timeline" component={Timeline} />
          <Route path="/get" component={BrowserUtil} />
          <Route path="/user/profile" component={Profile} />
          <Route exact path="/" component={Home} />
          <Route path="/home" component={Home} />
          <Route path="/documents" component={Documents} />
          <Route path="/assessment" component={Assessment} />
          <Route path="/articles/:id?" component={Articles} />
          <Route path="/about" component={About} />
          <Route path="/contact" component={Contact} />
          <Route path="/user/register" component={Register} />
          <Route path="/user/code" component={RegCode} />
          <Route path="/user/login" component={Login} />
          <Route path="/user/logout" component={Logout} />
          {/* <Footer /> */}
        </div>
      </Router>
    );
  }
}
