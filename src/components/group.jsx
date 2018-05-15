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
        var auth = localStorage.getItem('auth');
        var csrf = localStorage.getItem('csrf_token');
        var headers = {
            "Authorization": "Basic " + auth,
            'Access-Control-Allow-Origin': '*',
            'X-CSRF-Token': csrf,
            'Content-Type': 'application/json',
        };
        this.serverRequest = axios.get('https://eas-grist06.aston.ac.uk/admin/structure/views/view/group_membership', {
            headers: headers
          })
            .then(function (result) {
                console.log(result);
                // console.log(result.data.field_description[0].value);
                // console.log(result.data.field_body[0].value);
                self.setState({
                    article_title: result.data.field_description[0].value,
                    article_body: result.data.field_body[0].value
                });
            })
    }

    render() {
        return (
            <div className="row top-buffer">
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

