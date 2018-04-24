import React, { Component } from 'react';

import {
  BrowserRouter as Router,
  Route,
  browserHistory
} from 'react-router-dom';

import Navbar from './components/navbar.jsx';
import GraceMenu from './components/graceMenu.jsx';
import Footer from './components/footer.jsx';

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

class App extends Component {
  render() {
    return (
      <Router history={browserHistory}>
        <div className="container">
          <Navbar />
          {/* <GraceMenu /> */}
          <Route path="/mygrace/get" component={BrowserUtil} />
          <Route path="/mygrace/user/profile" component={Profile} />
          <Route exact path="/" component={Home} />
          <Route path="/mygrace/home" component={Home} />
          <Route path="/mygrace/documents" component={Documents} />
          <Route path="/mygrace/assessment" component={Assessment} />
          <Route path="/mygrace/articles/:id?" component={Articles} />
          <Route path="/mygrace/about" component={About} />
          <Route path="/mygrace/contact" component={Contact} />
          <Route path="/mygrace/user/register" component={Register} />
          <Route path="/mygrace/user/code" component={RegCode} />
          <Route path="/mygrace/user/login" component={Login} />
          <Route path="/mygrace/user/logout" component={Logout} />
          {/* <Footer /> */}
        </div>
      </Router>
    );
  }
}

export default App
