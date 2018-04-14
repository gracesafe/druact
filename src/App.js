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
import About from './components/about.jsx';
import Contact from './components/contact.jsx';
import Register from './components/register.jsx';
import Login from './components/login.jsx';
import Profile from './components/profile.jsx';
import Logout from './components/logout.jsx';

class App extends Component {
  render() {
    return (
      <Router history={browserHistory}>
        <div className="container">
          <Navbar />
          {/* <GraceMenu /> */}
          <Route path="/user/profile" component={Profile} />
          <Route exact path="/" component={Profile} />
          <Route path="/home" component={Home} />
          <Route path="/articles/:id?" component={Articles} />
          <Route path="/about" component={About} />
          <Route path="/contact" component={Contact} />
          <Route path="/user/register" component={Register} />
          <Route path="/user/login" component={Login} />
          <Route path="/user/logout" component={Logout} />
          {/* <Footer /> */}
        </div>
      </Router>
    );
  }
}

export default App
