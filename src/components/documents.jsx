import React, { Component } from 'react';
// import axios from 'axios';
import doRequest from "../utils/request";

import {
  NavLink
} from 'react-router-dom';

export default class Documents extends Component {

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
    console.log('https://eas-grist06.aston.ac.uk/drupal-api.php');
    var url = 'https://eas-grist06.aston.ac.uk/rest/content/file?_format=json';
    url = 'https://eas-grist06.aston.ac.uk/drupal-api.php?type=doc';
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
    this.fetchDocumentTitles();
    // this.fetchDocument();
  }

  render() {

    var rows = [];
    var self = this;
    this.state.documents.forEach(function (document, index) {
      // var title = document.field_document_type_value;
      var nid = document.field_document_author_value;
      var title = document.title;
      var desc = document.field_document_description_value
      var link = 'group?' + document.entity_id;
      // var title = document.title[0].value;
      // var nid = document.nid[0].value;
      // var link = document.field_link[0].uri;
      // console.log(link);
      if (title.toLowerCase().indexOf(self.state.keyword.toLowerCase()) !== -1) {
        // var path = '/rest/entity/file/' + nid;
        rows.push(<NavLink key={nid} data-value={nid} target="_blank" to={link} className="list-group-item list-group-item-action">
        <em>{title}</em>&nbsp;{desc}
        </NavLink>);
      }
    });

    return (
      <div className="row top-buffer">
        <div className="col">
          <h2>Documents</h2><br />
        </div>
        <div className="col">
          <form>
            <div className="form-group">
              <input name="keyword" value={this.state.keyword} onChange={this.updateSearchKeyword} type="text" className="form-control" placeholder="Search ..." />
            </div>
          </form>
        </div>
        <br />
        <div className="list-group col-md-10 offset-1 ">
          {rows}
        </div>
        <div className="col-md-8">
          <div className="card text-center">
            <div className="card-header">
              {this.state.document_title}
            </div>
            <div className="card-block" dangerouslySetInnerHTML={{ __html: this.state.document_body }} />
          </div>
        </div>
      </div>
    );
  }
}
