import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';

class Adminbar extends Component {

  constructor(props) {
    super(props);
    this.state = {
      username: localStorage.getItem('username'),
      groupAdmin: localStorage.getItem('group_administrator'),
      admin: localStorage.getItem('administrator')
    };
  }

  renderAdminLinks() {
    return (
      <span>
        <NavLink className="dropdown-item" activeClassName="active" to="/admin/register">
          <i className="fa fa-id-card"></i> Register User
        </NavLink>
      </span>
    );
  }

  render() {
    if (this.state.admin || this.state.groupAdmin) {
      return (
        <div>
          <nav className="navbar navbar-toggleable-md navbar-inverse nav">
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarTogglerAdmin">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarTogglerAdmin">
              <ul className="navbar-nav mr-auto">
                <li className="nav-item">
                  <NavLink className="nav-link" activeClassName="active" to="/admin/group">
                    <i className="fa fa-group"></i> Groups
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" activeClassName="active" to="/admin/register">
                    <i className="fa fa-user-plus"></i> Register New User
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" activeClassName="active" to="/research">
                    <i className="fa fa-user-plus"></i> Research
                  </NavLink>
                </li>
              </ul>
            </div>
          </nav>
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

export default Adminbar
