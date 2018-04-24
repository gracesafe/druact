import React, { Component, Button } from 'react';
import { NavLink } from 'react-router-dom';

class homeMenu extends Component {

  constructor(props) {
    super(props);
    this.state = {
      username: localStorage.getItem('username'),
      groupAdmin: localStorage.getItem('group_administrator')
    };
    this.handleClick = this.handleClick.bind(this);
  }

  componentWillReceiveProps() {
    this.setState({
      'username': localStorage.getItem('username')
    });
  }

  handleClick(event) {
    console.log(event);
  }

  renderCurrentLinks() {
    return (
      <span>
        <NavLink className="dropdown-item" activeClassName="active" to="/mygrace/home?m=1">
          <i className="fa fa-id-card"></i> My state of mind
          </NavLink>
        <NavLink className="dropdown-item" activeClassName="active" to="/mygrace/home?m=2">
          <i className="fa fa-sign-in"></i> What's happening in my life right now
          </NavLink>
        <NavLink className="dropdown-item" activeClassName="active" to="/mygrace/home?m=3">
          <i className="fa fa-sign-in"></i> What my health is like today
          </NavLink>
        <NavLink className="dropdown-item" activeClassName="active" to="/mygrace/home?m=4">
          <i className="fa fa-sign-in"></i> My safety
          </NavLink>
        <NavLink className="dropdown-item" activeClassName="active" to="/mygrace/home?m=5">
          <i className="fa fa-sign-in"></i> My wellbeing
          </NavLink>
        <NavLink className="dropdown-item" activeClassName="active" to="/mygrace/home?m=6">
          <i className="fa fa-sign-in"></i> Overview of everything: past and present
        </NavLink>
      </span>
    );
  }

  renderHistoryLinks() {
    return (
      <span>
        <NavLink className="dropdown-item" activeClassName="active" to="/mygrace/home?m=7">
          <i className="fa fa-id-card"></i> My life journey
        </NavLink>
        <NavLink className="dropdown-item" activeClassName="active" to="/mygrace/home?m=8">
          <i className="fa fa-sign-in"></i> My health and care
        </NavLink>
        <NavLink className="dropdown-item" activeClassName="active" to="/mygrace/home?m=9">
          <i className="fa fa-sign-in"></i> My personal details
        </NavLink>
        <NavLink className="dropdown-item" activeClassName="active" to="/mygrace/home?m=10">
          <i className="fa fa-sign-in"></i> My involvement with life and others
        </NavLink>
        <NavLink className="dropdown-item" activeClassName="active" to="/mygrace/home?m=11">
          <i className="fa fa-sign-in"></i> My personality and way of thinking
        </NavLink>
      </span>
    );
  }

  render() {

    var userLinkTitle = this.state.username ? this.state.username : 'User';
    var userLinkTitle = this.state.username ? this.state.username : 'User';
    var loggedIn = localStorage.getItem('auth');

    if (loggedIn) {

      return (
        <div>
          <div className="collapse navbar-collapse" id="navbarTogglerDemo01">
            <ul className="navbar-nav mr-auto mt-2 mt-lg-0">
              <li>
                <a className="nav-link" href="/mygrace/user/code" id="navbarButtonUsers">
                  <i className="fa fa-user"></i> Registration Code
              </a>
              </li>
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLinkCurrent" data-toggle="dropdown">
                  <i className="fa fa-user"></i> Current Events
                  </a>
                <div className="dropdown-menu">
                  {this.renderCurrentLinks()}
                </div>
              </li>
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLinkHistory" data-toggle="dropdown">
                  <i className="fa fa-user"></i> My History
                  </a>
                <div className="dropdown-menu">
                  {this.renderHistoryLinks()}
                </div>
              </li>
            </ul>
          </div>
        </div>
      );
    }
    else {
      return (
        <div />
      )
    }
  }
}

export default homeMenu
