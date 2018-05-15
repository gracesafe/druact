import React, { Component } from 'react';
// import axios from 'axios';
import doRequest from "../utils/request";

import {
  NavLink
} from 'react-router-dom';

export default class Page extends Component {

  constructor() {
    super();
    this.state = {
      dataUrl: [],
      page_title: '',
      page_body: '',
      page_menu: '',
      page_actions: '',
      page_images: '',
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

  fetchDocument(nid) {
    // var id;
    // if (nid !== undefined) {
    //   id = nid;
    // }
    // else if (this.props.match.params.id !== undefined) {
    //   id = this.props.match.params.id;
    // }
    // else {
    //   id = 6;
    // }
    // var self = this;
    // this.serverRequest = axios.get('https://eas-grist06.aston.ac.uk/rest/content/file/' + id + '?_format=json', {
    //   'Access-Control-Allow-Origin': '*',
    //   'Content-Type': 'application/json',
    // }).then(function (result) {
    //   console.log(result);
    //   self.setState({
    //     documents: result.data
    //   });
    // }).catch(function (error) {
    //   console.log(error);
    //   self.setState({
    //     document_body: error
    //   });
    // })
    // xdr(self, 'https://eas-grist06.aston.ac.uk/rest/content/file?_format=json', function (result) {
    //   console.log(result);
    //   }, function (error) {
    //     console.log(error);
    //     self.setState({
    //       document_body: error
    //     });
    //   })
    // console.log(result);
    // this.serverRequest = axios.get('https://eas-grist06.aston.ac.uk//rest/content/file?_format=json',
    // {
    //   'Access-Control-Allow-Origin': '*',
    //   'Content-Type': 'application/json',
    // },)
    //   .then(function (result) {
    //     var body = result.title["0"].value;
    //     self.setState({
    //       document_title: result.data.title["0"].value,
    //       document_body: body.replace('/sites/default/files', 'https://eas-grist06.aston.ac.uk/sites/default/files')
    //     });
    //   })
  }

  fetchDocumentTitles() {
    var self = this;
    doRequest(this, 'https://eas-grist06.aston.ac.uk/rest/content/file?_format=json', 'get', '', (function (result) {
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

    // this.serverRequest = axios.get('https://eas-grist06.aston.ac.uk/rest/content/file?_format=json', {
    //   'Access-Control-Allow-Origin': '*',
    //   'Content-Type': 'application/json',
    // }).then(function (result) {
    //   console.log(result);
    //   self.setState({
    //     documents: result.data
    //   });
    // }).catch(function (error) {
    //   console.log(error);
    //   self.setState({
    //     document_body: error
    //   });
    // });
    // xdr('https://eas-grist06.aston.ac.uk/entity/file?_format=json', 'GET', {}, (
    //   function (data) {
    //     self.setState({
    //       documents: data.data
    //     });
    //   }
    // ), (function (data) {
    //   self.setState({
    //     document_body: data
    //   });
    // }));
  }

  componentDidMount() {
    this.fetchDocumentTitles();
    // this.fetchDocument();
  }

  render() {

    var rows = [];
    var self = this;
    this.state.documents.forEach(function (document, index) {
      var title = document.title[0].value;
      var nid = document.nid[0].value;
      var link = document.field_link[0].uri;
      // console.log(link);
      if (title.toLowerCase().indexOf(self.state.keyword.toLowerCase()) !== -1) {
        // var path = '/rest/entity/file/' + nid;
        rows.push(<NavLink key={nid} data-value={nid} target="_blank" to={link} className="list-group-item list-group-item-action">{title}</NavLink>);
      }
    });

    return (
      <div className="row top-buffer">

            {page_title}
      {page_body}
      {page_menu}
      {page_actions}
      {page_images}
      {keyword}

        <div className="col-md-4">
          <h1>Documents</h1><br />
        </div>
        <div className="col-md-4">
          <form>
            <div className="form-group">
              <input name="keyword" value={this.state.keyword} onChange={this.updateSearchKeyword} type="text" className="form-control" placeholder="Search documents" />
            </div>
          </form>
        </div>
        <br />
        <div className="list-group offset-1 col-md-8">
          {rows}
        </div><br />
        {/* <div className="col-md-8">
          <div className="card text-center">
            <div className="card-header">
              {this.state.document_title}
            </div>
            <div className="card-block" dangerouslySetInnerHTML={{ __html: this.state.document_body }} />
          </div>
        </div> */}
      </div>
    );
  }
}


