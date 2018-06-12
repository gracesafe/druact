import React, { Component } from 'react';

export default class ActionBar extends Component {

    constructor() {
        super();
        this.state = {
            pageActions: [
                { 'text': 'Edit', 'clickFunction': 'ButtonClick' },
                { 'text': 'Save', 'clickFunction': 'ButtonClick' },
                { 'text': 'Delete', 'clickFunction': 'ButtonClick' },
                { 'text': 'Permissions', 'clickFunction': 'ButtonClick' }]
        };
    }

    componentDidMount() {
    }

    render() {

        var rows = [];
        var self = this;
        this.state.pageActions.forEach(function (action, index) {
            var title = action.text;
            var click = action.clickFunction;
            let key = action.text;
            rows.push(<li><a href="#" onClick={click} key={key}>{title}</a></li>);
        });

        return (
            <div className="page-actions">
                <ul>
                    {rows}
                </ul>
            </div>
        );
    }
}
