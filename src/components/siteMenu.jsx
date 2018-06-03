import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';

export default class SiteMenu extends Component {

  render() {
    return (
      <div className="row">
        <div className="col col-md-4">
          <ul className="navbar-nav mr-auto pad1 singleLineParent">
            <li>
              <NavLink exact className="nav-link" activeClassName="active" to="/news">
                <i className="fa fa-file"></i> News
                    </NavLink>
            </li>
            <li>
              <NavLink exact className="nav-link" activeClassName="active" to="/timeline">
                <i className="fa fa-file"></i> GRiST Timeline
                    </NavLink>
            </li>
            <li className="nav-item">
              <NavLink exact className="nav-link" activeClassName="active" to="/contact">
                <i className="fa fa-envelope"></i> Contact Us
                    </NavLink>
            </li>
            <li className="nav-item">
              <NavLink exact className="nav-link" activeClassName="active" to="/home?about">
                <i className="fa fa-info"></i> About
                    </NavLink>
            </li>
            <li className="nav-item singleLine">
              <NavLink exact className="nav-link" activeClassName="active" to="/documents">
                <i className="fa fa-file"></i> Documents
                    </NavLink>
            </li>
          </ul>
        </div>
      </div >
    );
  }
}


