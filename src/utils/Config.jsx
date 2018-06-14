import React, { Component } from 'react';
import doRequest from "../utils/request";

export default class Config extends Component {

    constructor() {
        super();
        this.state = {
            dataUrl: [],
            page_title: 'page title',
            page_layout: 'data list with side menu',
            page_body: 'description of the purpose of this page',
            page_menu: ['home', 'group', 'documents', 'contact'],
            page_actions: [
                { 'text': 'Edit', 'clickFunction': 'ButtonClick' },
                { 'text': 'Save', 'clickFunction': 'ButtonClick' },
                { 'text': 'Delete', 'clickFunction': 'ButtonClick' },
                { 'text': 'Permissions', 'clickFunction': 'ButtonClick' }],
            page_images: '',
            keyword: ''
        };

        this.updateSearchKeyword = this.updateSearchKeyword.bind(this);
        this.updateSelectedDocument = this.updateSelectedDocument.bind(this);
    }

    fetchDocumentTitles() {
        var self = this;
        var url = 'https://eas-grist06.aston.ac.uk/rest/content/file?_format=json';

        doRequest(this, url, 'get', '', (function (result) {
            console.log(result);
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
        this.state = Config.load(); 
    }

    render() {
        var rows = [];
        var self = this;
        // this.state.documents.forEach(function (document, index) {
        //   var title = document.title[0].value;
        //   var nid = document.nid[0].value;
        //   var link = document.field_link[0].uri;
        //   // console.log(link);
        //   if (title.toLowerCase().indexOf(self.state.keyword.toLowerCase()) !== -1) {
        //     // var path = '/rest/entity/file/' + nid;
        //     rows.push(<NavLink key={nid} data-value={nid} target="_blank" to={link} className="list-group-item list-group-item-action">{title}</NavLink>);
        //   }
        // });

        return (
            <div className="col top-buffer">
                <div className="row center">
                    <div className="page-actions col-md-3">
                        <h2>Actions</h2>
                        <ActionBar {...this.state.page_actions} />
                    </div>
                    <h1>{this.state.page_title}</h1>
                </div>
                <div className="row page-menu">
                    <div className="col  col-md-3">
                        <h2>Permissions</h2>
                        <ActionBar {...this.state.page_menu} />
                    </div>
                    {this.state.page_body}
                </div>
                <div className="row page-images"><h2>Images</h2>
                    {this.state.page_images}
                </div>
            </div>
        );
    }
}


