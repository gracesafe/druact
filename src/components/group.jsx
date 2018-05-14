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
import axios from 'axios';

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
        this.serverRequest = axios.get('https://eas-grist06.aston.ac.uk/group/35?_format=json')
            .then(function (result) {
                console.log(result);
                console.log(result.label[0].value);
                console.log(result.field_description[0].value);
                console.log(result.field_body[0].processed);
                // self.setState({
                //     article_title: result.data.title["0"].value,
                //     article_body: result.data.body["0"].value
                // });
            })
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

