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
        event.preven
        this.fetchDocument(event.target.getAttribute('data-value'));
    }

    fetchDocument(nid) {
        console.log("fetchDocument" + nid);
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
        var data = {"uid": localStorage.getItem('uid')};
        doRequest(this, url, 'get', data, (function (result) {
            console.log(result);
            self.setState({
                // document_title: result.data["0"].field_description_value,
                single: true,
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
        var url = 'https://eas-grist06.aston.ac.uk/drupal-api.php?uid=' + localStorage.getItem('uid');
        // if (id.length > 0) {
        //     url += "?" + id;
        // }
        console.log(url);
        doRequest(this, url, 'get', '', (function (result) {
            // console.log(result);
            self.setState({
                documents: result.data,
                document_body: result.data[0].field_body_value,
                single: false
            });
        }), (function (result) {
            // console.log(result);
            self.setState({
                document_body: result
            });
        }));
    }

    // showContent() {
    //     this.state.document_body
    //  onClick={self.updateSelectedDocument(document.entity_id)}

    // }

    componentDidMount() {
        console.log("result");
        this.fetchDocumentTitles();
        // this.fetchDocument();
    }

    render() {
        var rows = [];
        var self = this;
        console.log(window.location.search.length);
        if (window.location.search.length === 0)
            this.state.documents.forEach(function (document, index) {
                var title = document.field_description_value;
                var nid = document.entity_id;
                var link = document.entity_id;
                var group_content = document.field_body_value
                if (title.toLowerCase().indexOf(self.state.keyword.toLowerCase()) !== -1) {
                    rows.push
                        (
                        <div className="col-md-8">
                            <div className="card text-center">
                                <div className="card-header">
                                    <form>
                                        <div className="form-group">
                                            {title}
                                            {/* <button className="default pull-right">View</button> */}
                                        </div>
                                    </form>
                                </div>
                                <div className="card-block" dangerouslySetInnerHTML={{ __html: group_content }} />
                            </div>
                        </div>
                        );
                }
            });

        return (
            <div className="row top-buffer">
                <div className="col-md-4  offset-2">
                    <form>
                        <div className="form-group">
                            <input name="keyword" value={this.state.keyword} onChange={this.updateSearchKeyword} type="text" className="form-control" placeholder="Search groups" />
                        </div>
                    </form>
                    <br />
                </div>
                <br />
                <div className="list-group offset-1 col-md-12">
                    {rows}
                </div><br />
            </div>
        );

    }
}
