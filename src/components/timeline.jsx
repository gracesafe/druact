import React, { Component } from 'react';
// import axios from 'axios';
import doRequest from "../utils/request";

import {
  NavLink
} from 'react-router-dom';

export default class Timeline extends Component {

  constructor() {
    super();
    this.state = {
      documents: [],
      document_title: '',
      document_body: '',
      keyword: ''
    };

    this.updateSearchKeyword = this.updateSearchKeyword.bind(this);
    this.updateSelectedDocument = this.updateSelectedDocument.bind(this);
  }

  updateSearchKeyword(event) {
    this.setState({
      'keyword': event.target.value
    })
  }

  updateSelectedDocument(event) {
    this.fetchDocument(event.target.getAttribute('data-value'));
  }

  fetchDocumentTitles() {
    var self = this;
    var url = 'https://eas-grist06.aston.ac.uk/rest/content/file?_format=json';
    url = 'https://eas-grist06.aston.ac.uk/drupal-api.php?type=timeline';
    console.log("Getting data from: " + url);
    doRequest(this, url, 'get', '', (function (result) {
      // console.log(result);
      self.setState({
        documents: result.data
      });
    }), (function (result) {
      // console.log(result);
      self.setState({
        document_body: result
      });
    }));
  }

  componentDidMount() {
    console.log (window.location.search);

    this.fetchDocumentTitles();
    // this.fetchDocument();
  }

  render() {
    console.log (window.location.search);

    var rows = [];
    var documentTypes = [];
    var self = this;
    this.state.documents.forEach(function (document, index) {
      // var title = document.field_document_type_value;
      // var title = document.title;
      var date = document.field_timeline_event_date_value;
      var desc = document.field_timeline_event_body_value;
      // var desc = document.field_timeline_event_body_value;
      
      desc = desc.replace(/<(.|\n)*?>/g, '');
      // if (title.toLowerCase().indexOf(self.state.keyword.toLowerCase()) !== -1) {
        // var path = '/rest/entity/file/' + nid;
        rows.push(<div><em>{date}</em>&nbsp;{desc}</div>);
      // }
    });
    documentTypes.push(''); // empty row for all types
    return (
      <div className="row top-buffer">
        <div className="col">
          <h2>Timeline</h2><br />
        </div>
        <br />
        <div className="list-group col-md-10 offset-1 ">
          {rows}
        </div>
      </div>
    );
  }
}
