import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';

export default class TopMenu extends Component {

    constructor(props) {
        super(props);

        this.state = {
            username: localStorage.getItem('username')
        };
    }
    
    render() {
        var siteMap = require('./customData.json');

        var loggedIn = localStorage.getItem('auth');
        var loggedInAdmin = localStorage.getItem('admin');
        let menuItems = [];

        // add anonymous menu items for the top menu
        siteMap.forEach(function (page, index) {
            if (page.roles.includes('anonymous')){
                menuItems.push(page.name)
            }
        });
        
        // add authenticated menu items for the top menu
        if (loggedIn) {
        }

        // add administrator menu items for the top menu
        if (loggedInAdmin) {
        }

        return (
            <div className="row top-buffer">
                <div className="col">
                    <img src="/images/grist_header.png" alt="Home" className="img-fluid stretch" />
                    <nav className="navbar navbar-toggleable-md navbar-inverse bg-success">
                        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarTogglerDemo01">
                            <span className="navbar-toggler-icon"></span>
                        </button>
                        <div className="collapse navbar-collapse" id="navbarTogglerDemo01">
                            <ul className="navbar-nav mr-auto mt-2 mt-lg-0">
                                {menuItems}
                            </ul>
                        </div>
                    </nav>
                </div>
            </div>
        );
    }
}