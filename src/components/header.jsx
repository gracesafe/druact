import React, { Component } from 'react';

export default class Header extends Component {

  render() {
    return (
      <div className="row top-buffer">
        <div className="col">
          <img src="/images/grist_header.png" alt="Home" className="img-fluid stretch" />
        </div>
      </div>
    );
  }
}


