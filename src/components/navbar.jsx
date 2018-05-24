import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';

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
    var userLinkTitle = this.state.username ? this.state.username : 'User';
    var loggedIn = localStorage.getItem('auth');
    if (loggedIn) {
      return (
        <span>
          <li className="nav-item dropdown">
            <a className="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" data-toggle="dropdown">
              <i className="fa fa-user"></i>User: {userLinkTitle}
            </a>
            <div className="dropdown-menu">
              <NavLink className="dropdown-item" activeClassName="active" to="/user/profile">
                <i className="fa fa-user-circle"></i> Account Profile
              </NavLink>
              <NavLink className="dropdown-item" activeClassName="active" to="/user/logout">
                <i className="fa fa-sign-out"></i> Logout
              </NavLink>
            </div>
          </li>
        </span>
      );
    }
    else {
      return (
        <li className="nav-item">
          <NavLink exact className="nav-link" activeClassName="active" to="/user/login">
            <i className="fa fa-sign-in"></i> Login
          </NavLink>
        </li>
      );
    }
  }

  renderAppLinks() {
    var loggedIn = localStorage.getItem('auth');
    var groupAdmin = localStorage.getItem('group_administrator');
    if (loggedIn) {
      if (groupAdmin) {
        return (
          <li className="nav-item dropdown">
            <a className="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" data-toggle="dropdown">
              <i className="fa fa-user"></i> Actions
              </a>
            <div className="dropdown-menu">
              <NavLink exact className="nav-item" activeClassName="active" to="/registration">
                <i className="fa fa-file"></i> User Registration
                </NavLink><br/>
                <NavLink exact className="nav-item" activeClassName="active" to="/group">
                <i className="fa fa-file"></i> Groups
                </NavLink>
            </div>
          </li>
        );
      } else {
        return (
          <span>
            <li>
              <NavLink exact className="nav-link" activeClassName="active" to="/group">
                <i className="fa fa-file"></i> Groups
            </NavLink>
            </li>
            <li>
              <NavLink exact className="nav-link" activeClassName="active" to="/group">
                <i className="fa fa-file"></i> Groups
            </NavLink>
            </li>
          </span>
        );
      }
      // <li className="nav-item dropdown">
      //   <a className="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" data-toggle="dropdown">
      //     <i className="fa fa-link"></i> Applications
      //   </a>
      //   <div className="dropdown-menu">
      //     <NavLink className="dropdown-item" activeClassName="active" to="/group">
      //       <i className="fa fa-wrench"></i> Group
      //     </NavLink>
      //     <NavLink className="dropdown-item" activeClassName="active" to="/grist">
      //       <i className="fa fa-wrench"></i> GRiST
      //     </NavLink>
      //     <NavLink className="dropdown-item" activeClassName="active" to="/grace">
      //       <i className="fa fa-sitemap"></i> GRaCE
      //     </NavLink>
      //   </div>
      // </li>
    }
  }

  render() {

    // var loggedIn = localStorage.getItem('auth');

    // if (loggedIn) {

    return (
      <div className="row top-buffer">
        <div className="col">
          <img src="/images/grist_header.png" alt="Home" className="img-fluid stretch" />
          <nav className="navbar navbar-toggleable-md navbar-inverse bg-success">
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarTogglerDemo01">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarTogglerDemo01">
              <ul className="navbar-nav mr-auto mt-2 mt-lg-0">
                <li className="nav-item">
                  <NavLink exact className="nav-link" activeClassName="active" to="/">
                    <i className="fa fa-home"></i> Home
                      {/* <img src='/public/imageslogo.png' className="img-fluid"/> */}
                  </NavLink>
                </li>
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
                <li>
                  <NavLink exact className="nav-link" activeClassName="active" to="/documents">
                    <i className="fa fa-file"></i> Documents
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
                {this.renderAppLinks()}
                {this.renderUserLinks()}
              </ul>
            </div>
          </nav>
        </div>
      </div>
    );
  }
  //   else {
  //     return (
  //       <div className="row top-buffer">
  //         <div className="col">
  //           <img src="/images/grist_header.png" alt="Home" className="img-fluid stretch" />
  //           <nav className="navbar navbar-toggleable-md navbar-inverse bg-success">
  //             <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarTogglerDemo01">
  //               <span className="navbar-toggler-icon"></span>
  //             </button>
  //             <div className="collapse navbar-collapse" id="navbarTogglerDemo01">
  //               <ul className="navbar-nav mr-auto mt-2 mt-lg-0">
  //                 <li className="nav-item">
  //                   <NavLink exact className="nav-link" activeClassName="active" to="/home">
  //                     <i className="fa fa-home"></i> Home
  //                 </NavLink>
  //                 </li>
  //                 <li className="nav-item">
  //                   <NavLink exact className="nav-link" activeClassName="active" to="/documents">
  //                     <i className="fa fa-file-text-o"></i> Documents
  //                 </NavLink>
  //                 </li>
  //                 <li className="nav-item">
  //                   <NavLink exact className="nav-link" activeClassName="active" to="/news">
  //                     <i className="fa fa-newspaper-o"></i> News &amp; Events
  //                 </NavLink>
  //                 </li>
  //                 <li className="nav-item">
  //                   <NavLink exact className="nav-link" activeClassName="active" to="/home?about">
  //                     <i className="fa fa-info-circle"></i> About
  //                 </NavLink>
  //                 </li>
  //                 <li className="nav-item dropdown">
  //                   <a className="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" data-toggle="dropdown">
  //                     <i className="fa fa-tasks"></i> Applications
  //                   </a>
  //                   <div className="dropdown-menu">
  //                     <span>
  //                       <a className="dropdown-item" activeClassName="active" href="https://www.secure.egrist.org/admin/simulators/mh-dss-assess-html-light-launch-anonymous.php" >
  //                         <i className="fa fa-check-circle"></i> GRiST
  //                       </a>
  //                       <NavLink className="dropdown-item" activeClassName="active" to="/grace">
  //                         <i className="fa fa-user-circle"></i> GRaCE
  //                       </NavLink>
  //                     </span>
  //                   </div>
  //                 </li>
  //                 <li className="nav-item dropdown">
  //                   <a className="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" data-toggle="dropdown">
  //                     <i className="fa fa-user"></i> User: {userLinkTitle}
  //                   </a>
  //                   <div className="dropdown-menu">
  //                     {this.renderUserLinks()}
  //                   </div>
  //                 </li>
  //               </ul>
  //             </div>
  //           </nav>
  //         </div>
  //       </div>
  //     );
  //   }
  // }
}

export default Navbar
