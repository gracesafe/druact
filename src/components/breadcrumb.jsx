import React, { Component } from 'react';

class Breadcrumb extends Component {
  render() {

    console.log(window.location.href);
    var trail = window.location.href.split('/');
    console.log(trail);
    console.log(trail.length);
    if (trail.length <= 3) {
      return null;
    } else if (trail.length === 4 && trail[3] !== "") {
      var level = trail[3]
      return (
        <div className="col">
          <a href="/" className="crumb">home</a>
          <i className="fa fa-chevron-right" aria-hidden="true"></i>
          <a href="/" className="crumb">{level}</a>
        </div>
      );
    } else if (trail.length >= 5) {
      var level1 = trail[3]
      var level1url = "/" + trail[3]
      var level2 =  trail[4]
      var level2url =  level1url + "/" + trail[4]
      return (
        <div className="col">
          <a href="/" className="crumb">home</a>
          <i className="fa fa-chevron-right" aria-hidden="true"></i>
          <a href={level1url} className="crumb">{level1}</a>
          <i className="fa fa-chevron-right" aria-hidden="true"></i>
          <a href={level2url} className="crumb">{level2}</a>
        </div>
      );
    } else {
      return null;
    }
  }
}

export default Breadcrumb
