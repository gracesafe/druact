/**
 * @author Aman Soni
 * # Purpose
 * The Group Home Page
 * 
 * # TODO 
 * 
 * # Changes
 * 
 */

import React, { Component } from "react";
import _ from "lodash";
import doRequest from "../utils/request";

export default class Group extends Component {

    constructor() {
        super();
        this.state = {
            article_title: '',
            article_body: ''
        };
    }

    componentDidMount() {
        var self = this;
        doRequest(this, 'https://eas-grist06.aston.ac.uk/group/35?_format=json', 'get', '', (function (result) {
            console.log(result);
            self.setState({
                documents: result.data
            });
        }), (function (result) {
            console.log(result);
            self.setState({
                document_body: result
            });
        }));
    }

    render() {
        return (
            <div className="row top-buffer">
                <h1>Group</h1>
                <div className="col">
                    <div className="card text-center">
                        <div className="card-header">
                            {this.state.article_title}
                        </div>
                        <div className="card-block" dangerouslySetInnerHTML={{ __html: this.state.article_body }} />
                    </div>
                </div>
            </div>
        );
    }
}

