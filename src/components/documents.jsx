import React, { Component } from 'react';
import axios from 'axios';

import {
  NavLink
} from 'react-router-dom';

class Documents extends Component {

  constructor() {
    super();
    this.state = {
      articles: [],
      article_title: '',
      article_body: '',
      keyword: ''
    };

    this.updateSearchKeyword = this.updateSearchKeyword.bind(this);
    this.updateSelectedArticle = this.updateSelectedArticle.bind(this);
  }

  updateSearchKeyword(event) {
    this.setState({
      'keyword': event.target.value
    })
  }

  updateSelectedArticle(event) {
    this.fetchArticle(event.target.getAttribute('data-value'));
  }

  fetchArticle(nid) {
    var id;
    if (nid !== undefined) {
      id = nid;
    }
    else if (this.props.match.params.id !== undefined) {
      id = this.props.match.params.id;
    }
    else {
      id = 6;
    }
    var self = this;
    this.serverRequest = axios.get('https://eas-grist06.aston.ac.uk/entity/file?_format=json')
      .then(function (result) {
        var body = result.data.body["0"].value;
        self.setState({
          article_title: result.data.title["0"].value,
          article_body: body.replace('/sites/default/files', 'https://eas-grist06.aston.ac.uk/sites/default/files')
        });
      })
  }

  fetchArticleTitles() {
    var self = this;
    this.serverRequest = axios.get('https://eas-grist06.aston.ac.uk/entity/file')
      .then(function (result) {
        self.setState({
          articles: result.data
        });
      })
  }

  componentDidMount() {
    this.fetchArticleTitles();
    this.fetchArticle();
  }

  render() {

    var rows = [];
    var self = this;
    this.state.articles.forEach(function (article, index) {
      if (article.title.toLowerCase().indexOf(self.state.keyword.toLowerCase()) !== -1) {
        var path = '/articles/' + article.nid;
        rows.push(<NavLink key={article.nid} data-value={article.nid} onClick={self.updateSelectedArticle} to={path} className="list-group-item list-group-item-action">{article.title}</NavLink>);
      }
    });

    return (
      <div className="row top-buffer">
        <div className="col-md-4">
          <h1>Documents</h1><br/>
        </div>
        <div className="col-md-4">
          <form>
            <div className="form-group">
              <input name="keyword" value={this.state.keyword} onChange={this.updateSearchKeyword} type="text" className="form-control" placeholder="Search documents" />
            </div>
          </form>
          <div className="list-group">
            {rows}
          </div><br />
        </div>
        <div className="col-md-8">
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

export default Documents
