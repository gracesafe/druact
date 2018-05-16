/**
 * @author Aman Soni
 *   # Purpose
 * The Group Home Page
 * 
 * # TODO 
 * 
 * # Changes
 * 
 */
import React, { Component } from 'react';
// import axios from 'axios';
import doRequest from "../utils/request";

import {
    NavLink
} from 'react-router-dom';

export default class Group extends Component {

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

    fetchDocument(nid) {
        var id;
        if (nid !== undefined) {
            id = nid;
        }
        else if (this.props.match.params.id !== undefined) {
            id = this.props.match.params.id;
        }
        else {
            id = 19;
        }
        var self = this;
        var url = 'https://eas-grist06.aston.ac.uk/drupal-api.php?group_id=' + id;
        doRequest(this, url, 'get', '', (function (result) {
            console.log(result);
            self.setState({
                // document_title: result.data["0"].field_description_value,
                document_body: result.data["0"].field_body_value
            });
        }), (function (result) {
            // console.log(result);
            self.setState({
                document_body: result
            });
        }));
        // this.serverRequest = axios.get('https://eas-grist06.aston.ac.uk/node/' + id + '?_format=json')
        //   .then(function (result) {
        //     var body = result.data.body["0"].value;
        //     self.setState({
        //       article_title: result.data.title["0"].value,
        //       article_body: body.replace('/sites/default/files', 'https://eas-grist06.aston.ac.uk/sites/default/files')
        //     });
        //   })
    }

    fetchDocumentTitles() {
        var self = this;
        console.log(window.location.search);
        var id = window.location.search.replace('?', '')
        console.log(id);
        console.log('https://eas-grist06.aston.ac.uk/drupal-api.php');
        var url = 'https://eas-grist06.aston.ac.uk/drupal-api.php';
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
            console.log("result");
        this.fetchDocumentTitles();
        this.fetchDocument();
    }

    render() {

        var rows = [];
        var self = this;
        this.state.documents.forEach(function (document, index) {
            var title = document.field_description_value;
            var nid = document.entity_id;
            var link = 'group?' + document.entity_id;
            if (title.toLowerCase().indexOf(self.state.keyword.toLowerCase()) !== -1) {
                rows.push(<NavLink key={nid} data-value={nid} to={link} className="list-group-item list-group-item-action">{title}</NavLink>);
            }
        });

        return (
            <div className="row top-buffer">
                <div className="col-md-4">
                    <h1>Groups</h1><br />
                </div>
                <div className="col-md-4">
                    <form>
                        <div className="form-group">
                            <input name="keyword" value={this.state.keyword} onChange={this.updateSearchKeyword} type="text" className="form-control" placeholder="Search groups" />
                        </div>
                    </form>
                </div>
                <br />
                <div className="col-md-8">
                    <div className="card text-center">
                        <div className="card-header">
                            {this.state.document_title}
                        </div>
                        <div className="card-block" dangerouslySetInnerHTML={{ __html: this.state.document_body }} />
                    </div>
                </div>
                <br />
                <div className="list-group offset-1 col-md-8">
                    {rows}
                </div><br />
            </div>
        );
    }
}
