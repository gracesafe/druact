import React, { Component } from 'react';

class Footer extends Component {
  render() {
    return (
      <div className="row top-buffer bottom-buffer">
        <div className="col">
          <div className="card">
            <div className="card-block text-center">
              Built on&nbsp;<a href="https://www.egrist.org/" target="_blank" rel="noopener">GRiST</a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Footer
