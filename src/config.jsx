import React, { Component } from 'react';

import {
  BrowserRouter as Router,
  Route,
  browserHistory
} from 'react-router-dom';

export default class Config extends Component {
    constructor(props) {
        super(props);
        this.state = {
            config: localStorage.getItem('config'),
            user: localStorage.getItem('user'),
            data: localStorage.getItem('data'),
            display: localStorage.getItem('display'),
            action: localStorage.getItem('action'),
        };
    }

    init() {

    }

    render() {
        var title = getTitle();
        var description = getDescription();
        var links = getLinks();

        return (
            <div className="row top-buffer">
                <div className="col">
                    <div>{title}</div>
                    <div>{description}</div>
                    <div>{links}</div>
                </div>
            </div>
        );
    }
}  