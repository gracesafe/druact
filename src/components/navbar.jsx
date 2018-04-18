import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import GraceMenu from './graceMenu.jsx';

class Navbar extends Component {

  constructor(props) {
    super(props);
    this.state = {
      username: localStorage.getItem('username')
    };
  }

  componentWillReceiveProps() {
    this.setState({
      'username': localStorage.getItem('username')
    });
  }

  renderUserLinks() {
    var loggedIn = localStorage.getItem('auth');
    if (loggedIn) {
      return (
        <span>
          <NavLink className="dropdown-item" activeClassName="active" to="/user/profile">
            <i className="fa fa-user-circle"></i> User Account Profile
          </NavLink>
          <NavLink className="dropdown-item" activeClassName="active" to="/user/logout">
            <i className="fa fa-sign-out"></i> Logout
          </NavLink>
        </span>
      );
    }
    else {
      return (
        <span>
          <NavLink className="dropdown-item" activeClassName="active" to="/user/register">
            <i className="fa fa-id-card"></i> Register
          </NavLink>
          <NavLink className="dropdown-item" activeClassName="active" to="/user/login">
            <i className="fa fa-sign-in"></i> Login
          </NavLink>
        </span>
      );
    }
  }

  render() {

    var userLinkTitle = this.state.username ? this.state.username : 'User';
    var loggedIn = localStorage.getItem('auth');

    if (loggedIn) {

      return (
        <div className="row top-buffer">
        <div className="row">
          <img src="/images/grist_header.png" alt="Home" />
        </div>
          <div className="col">
            <nav className="navbar navbar-toggleable-md navbar-inverse bg-success">
              <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarTogglerDemo01">
                <span className="navbar-toggler-icon"></span>
              </button>
              <div className="collapse navbar-collapse" id="navbarTogglerDemo01">
                <ul className="navbar-nav mr-auto mt-2 mt-lg-0">
                  <li className="nav-item">
                    <NavLink exact className="nav-link" activeClassName="active" to="/">
                      <i className="fa fa-home"></i> Home
                      {/* <img src='/public/images/mygracelogo.png' className="img-fluid"/> */}
                    </NavLink>
                  </li>
                  <GraceMenu />
                  <li className="nav-item dropdown">
                    <a className="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" data-toggle="dropdown">
                      <i className="fa fa-user"></i> User: {userLinkTitle}
                    </a>
                    <div className="dropdown-menu">
                      {this.renderUserLinks()}
                    </div>
                  </li>
                </ul>
              </div>
            </nav>
          </div>
        </div>
      );
    } else {
      return (
        <div className="row top-buffer">
          <div className="col">
            <img src="/images/grist_header.png" alt="Home" /><br />
            <nav className="navbar navbar-toggleable-md navbar-inverse bg-success">
              <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarTogglerDemo01">
                <span className="navbar-toggler-icon"></span>
              </button>
              <div className="collapse navbar-collapse" id="navbarTogglerDemo01">
                <ul className="navbar-nav mr-auto mt-2 mt-lg-0">
                  <li className="nav-item">
                    <NavLink exact className="nav-link" activeClassName="active" to="/home">
                      <i className="fa fa-home"></i> Home
                  </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink exact className="nav-link" activeClassName="active" to="/documents">
                      <i className="fa fa-file-text-o"></i> Documents
                  </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink exact className="nav-link" activeClassName="active" to="/news">
                      <i className="fa fa-newspaper-o"></i> News &amp; Events
                  </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink exact className="nav-link" activeClassName="active" to="/">
                      <i className="fa fa-info-circle"></i> About
                  </NavLink>
                  </li>
                  <li className="nav-item dropdown">
                    <a className="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" data-toggle="dropdown">
                      <i className="fa fa-tasks"></i> Applications
                    </a>
                    <div className="dropdown-menu">
                      <span>
                      <a className="dropdown-item" activeClassName="active" href="https://www.secure.egrist.org/admin/simulators/mh-dss-assess-html-light-launch-anonymous.php" >
                          <i className="fa fa-check-circle"></i> GRiST
                    </a>
                        <NavLink className="dropdown-item" activeClassName="active" to="/grace">
                          <i className="fa fa-user-circle"></i> GRaCE
          </NavLink>
                      </span>
                    </div>
                  </li>
                  <li className="nav-item dropdown">
                    <a className="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" data-toggle="dropdown">
                      <i className="fa fa-user"></i> User: {userLinkTitle}
                    </a>
                    <div className="dropdown-menu">
                      {this.renderUserLinks()}
                    </div>
                  </li>
                </ul>
              </div>
            </nav>
          </div>
        </div>
      );
    }
  }
}

export default Navbar
