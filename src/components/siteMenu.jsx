import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';

export default class SiteMenu extends Component {

  render() {
    return (
      <div className="row">
          <ul className="navbar-nav mr-auto mt-2 mt-lg-0 pad1">
            <li className="nav-item">
              <NavLink exact className="nav-link" activeClassName="active" to="/group">
                <i className="fa fa-group"></i> My Groups
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink exact className="nav-link" activeClassName="active" to="/documents">
                <i className="fa fa-file"></i> Documents
              </NavLink>
            </li>
          </ul>
        </div>
    );
  }
}


