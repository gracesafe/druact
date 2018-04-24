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
      console.log(window.location.search);
      var url = 'https://eas-grist06.aston.ac.uk/admin/home?_format=json';
      if (window.location.search == '?about')
        url = 'https://eas-grist06.aston.ac.uk/admin/about?_format=json';

      this.serverRequest = axios.get(url)
      .then(function(result){
        self.setState({
          article_title: result.data.title["0"].value,
          article_body: result.data.body["0"].value
        });
      })
    }
  
    render(){
      return (
        <div className="row top-buffer">
          <div className="col">
            <div className="card text-center">
              <div className="card-header">
                {this.state.article_title}
              </div>
              <div className="card-block" dangerouslySetInnerHTML={{__html: this.state.article_body}} />
            </div>
          </div>
        </div>
      );
    }
  }

export default Home
