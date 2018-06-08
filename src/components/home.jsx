/**
 * @author Aman Soni
 * # Purpose
 * Presents assesment sections for user to select questions to answer.
 * Uses an iframe to display data from the existing myGrace assessment form.
 * 
 * # TODO 
 * Config setting for urls
 * 
 * # Changes
 * 
 */

import React, { Component } from "react";
import _ from "lodash";
import axios from 'axios';
import SiteMenu from "../components/siteMenu"
class Home extends Component {

  constructor() {
    super();
    this.state = {
      article_title: '',
      article_body: ''
    };
  }

  componentDidMount() {
    var self = this;
    var url = 'https://eas-grist06.aston.ac.uk/rest/content?_format=json';
    var id = 1;
    if (window.location.search === '?about')
      id = 0;
    // url = 'https://eas-grist06.aston.ac.uk/about?_format=json';

    console.log('url: ' + url);
    console.log(window.location.search);

    this.serverRequest = axios.get(url)
      .then(function (result) {
        console.log(result);
        self.setState({
          article_title: result.data[id].title["0"].value,
          article_body: result.data[id].body["0"].value
        });
      })
  }

  render() {
    return (
      <div className="row top-buffer">
        <div className="col">
          <div className="row">
            <div className="col-md-2"><SiteMenu /></div>
            <div className="col-md-10">
              <div className="card text-center">
                {/* <div className="card-header">
                  {this.state.article_title}
                </div> */}
                <div className="card-block" dangerouslySetInnerHTML={{ __html: this.state.article_body }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Home
