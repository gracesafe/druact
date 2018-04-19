import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';

class GraceNav extends Component {

  constructor(props) {
    super(props);
    this.state = {
      username: localStorage.getItem('username')
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
    // document.getElementsByTagName('iframe')[0].contentWindow.LayoutManager.setupWellBeingAssessment();
    // document.getElementsByTagName('iframe')[0].contentWindow.GlobalVariables.currentMygraceVersionPathways = 2;
    // document.getElementsByTagName('iframe')[0].contentWindow.LayoutManager.setupWellBeingAssessment();

    //
    // .setupWellBeingAssessment();
    // var w = document.getElementsByTagName('iframe')[0].contentWindow;
    // w.GlobalVariables.currentMygraceVersionPathways = w.GlobalVariables.mygraceVersionPathways.MY_SAFETY;
    // w.LayoutManager.setupScreeningOnly();
  }

  renderRegCodeLink() {
    var groupAdmin = localStorage.getItem('group_administrator');

    if (groupAdmin) {
      return (
        <li className="nav-item">
          <NavLink className="nav-link" activeClassName="active" to="/user/regcode">
          <i className="fa fa-chevron-left"></i><i className="fa fa-chevron-right"></i> Registration Code
        </NavLink>
        </li>
      )
    }
  }

  renderCurrentLinks() {
    return (
      <span>
        <NavLink className="dropdown-item" activeClassName="active" to="/home?m=1">
          <i className="fa fa-id-card"></i> My state of mind
          </NavLink>
        <NavLink className="dropdown-item" activeClassName="active" to="/home?m=2">
          <i className="fa fa-sign-in"></i> What's happening in my life right now
          </NavLink>
        <NavLink className="dropdown-item" activeClassName="active" to="/home?m=3">
          <i className="fa fa-sign-in"></i> What my health is like today
          </NavLink>
        <NavLink className="dropdown-item" activeClassName="active" to="/home?m=4">
          <i className="fa fa-sign-in"></i> My safety
          </NavLink>
        <NavLink className="dropdown-item" activeClassName="active" to="/home?m=5">
          <i className="fa fa-sign-in"></i> My wellbeing
          </NavLink>
        <NavLink className="dropdown-item" activeClassName="active" to="/home?m=6">
          <i className="fa fa-sign-in"></i> Overview of everything: past and present
        </NavLink>
      </span>
    );
  }

  renderHistoryLinks() {
    return (
      <span>
        <NavLink className="dropdown-item" activeClassName="active" to="/home?m=7">
          <i className="fa fa-id-card"></i> My life journey
        </NavLink>
        <NavLink className="dropdown-item" activeClassName="active" to="/home?m=8">
          <i className="fa fa-sign-in"></i> My health and care
        </NavLink>
        <NavLink className="dropdown-item" activeClassName="active" to="/home?m=9">
          <i className="fa fa-sign-in"></i> My personal details
        </NavLink>
        <NavLink className="dropdown-item" activeClassName="active" to="/home?m=10">
          <i className="fa fa-sign-in"></i> My involvement with life and others
        </NavLink>
        <NavLink className="dropdown-item" activeClassName="active" to="/home?m=11">
          <i className="fa fa-sign-in"></i> My personality and way of thinking
        </NavLink>
      </span>
    );
  }

  render() {

    // var userLinkTitle = this.state.username ? this.state.username : 'User';

    return (
      <div>
        <div className="collapse navbar-collapse" id="navbarTogglerDemo01">
          <ul className="navbar-nav mr-auto mt-2 mt-lg-0">
            <li>
              <a className="nav-link" href="/documents" id="navbarButtonTest">
                <i className="fa fa-file"></i> Documents
              </a>
            </li>
            {this.renderRegCodeLink()}
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" data-toggle="dropdown">
                <i className="fa fa-tasks"></i> Applications
                    </a>
              <div className="dropdown-menu">
                <span>
                  <a className="dropdown-item" href="https://www.secure.egrist.org/admin/simulators/mh-dss-assess-html-light-launch-anonymous.php" >
                    <i className="fa fa-check-circle"></i> GRiST
                    </a>
                  <NavLink className="dropdown-item" activeClassName="active" to="/grace">
                    <i className="fa fa-user-circle"></i> GRaCE
                  </NavLink>
                </span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    );
  }
}

export default GraceNav

/*
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
*/