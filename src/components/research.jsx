import React, { Component } from 'react';
import axios from 'axios';

import {
  NavLink
} from 'react-router-dom';

class BrowserUtil extends Component {

  constructor() {
    super();
    this.state = {
      _id: 'item id',
      _name: 'item name',
      pocketv3: 'https://getpocket.com/v3/get',
      pocketAuth:'https://getpocket.com/v3/oauth/authorize',
      short_text: 'Item short text',
      item_taxonomy: [],
      item_state: 'new',
      is_dirty: 'false',
      item_props: ['text', ' test', 'property'],
      item_tags: ['text', ' test', 'property'],
      item_authors: ['aman', 'author_id'],
      item_repositries: []
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

    this.serverRequest = axios.get('https://eas-grist06.aston.ac.uk/node/' + id + '?_format=json')
      .then(function (result) {
        var body = result.data.body["0"].value;
        self.setState({
          article_title: result.data.title["0"].value,
          article_body: body.replace('/sites/default/files', 'https://eas-grist06.aston.ac.uk/sites/default/files')
        });
      })
  }

  componentWillUpdate() {
    var c = document.getElementsByTagName('iframe')[0].contentWindow.__html;
    console.log(c);
  }
  fetchArticleTitles() {
    var self = this;
    this.serverRequest = axios.get('https://eas-grist06.aston.ac.uk/api/v1/articles/list')
      .then(function (result) {
        self.setState({
          articles: result.data
        });
      })
  }

  fetchPocketItems() {
    var self = this;
    
    axios.post(this.state.pocketAuth, {
      consumer_key: '76860-1057e4f9e8d6154ac5f0d028',
      redirect_uri: 'locahost:3000'})
      .then(function (response) {
        var access_token = response.access_token; 
        self.setState({
          'access_token': response.access_token,
          'success': 'Login successful',
          'error': ''
        });

    axios.post(this.state.pocketv3, {
      consumer_key: '76860-1057e4f9e8d6154ac5f0d028',
      access_token: this.state.access_token,
      "count": "10",
      "detailType": "complete"})
      .then(function (response) {
        // var 
        self.setState({
          'success': 'Login successful',
          'error': ''
        });

        localStorage.setItem('username', response.data.current_user.name);
        localStorage.setItem('uid', response.data.current_user.uid);
        localStorage.setItem('csrf_token', response.data.csrf_token);
        localStorage.setItem('logout_token', response.data.logout_token);
        localStorage.setItem('auth', window.btoa(self.state.name + ':' + self.state.password));
        for (var i = 0; i < response.data.roles; i++) {
          localStorage.setItem(response.data.roles[i], true);
        }

        // login to GRiST if the drupal login is successful
        axios.post('https://www.secure.egrist.org/login-headless.php?u=trust-su-drupal&p=delta4force&metaClinID=', 'GET')
          .then(function (response) {
            self.setState({
              'success': 'Login successful',
              'error': ''
            });

            var session = response['data'];
            localStorage.setItem('sid', session);
            console.log(session);

            self.setState({ redirect: true });
          }).catch(function (error) {
            console.log(error);
            self.setState({
              'success': '',
              'error': error
            });
          });

        // self.setState({ redirect: true });
      })
      .catch(function (error) {
        console.log(error);
        var errorResponse = error.message;
        errorResponse = errorResponse.replace(/(?:\r\n|\r|\n)/g, '<br />');
        self.setState({
          'success': '',
          'error': errorResponse
        });
      });
      })
      .catch(function (error) {
        console.log(error);
        var errorResponse = error.message;
        errorResponse = errorResponse.replace(/(?:\r\n|\r|\n)/g, '<br />');
        self.setState({
          'success': '',
          'error': errorResponse
        });
      });
  }

  componentDidMount() {
    //   this.fetchArticleTitles();
    //   this.fetchArticle();
    //
    this.fetchPocketItems();

  }

  render() {

    var rows = [];
    var self = this;
    var message = 'Let\'s go...'

    var c = 'test content';
    var sourceURL = 'https://en.m.wikipedia.org/w/index.php?title=Knowledge_representation_and_reasoning&article_action=watch';
    // this.state.articles.forEach(function (article, index) {
    //   if (article.title.toLowerCase().indexOf(self.state.keyword.toLowerCase()) !== -1) {
    //     var path = '/articles/' + article.nid;
    //     rows.push(<NavLink key={article.nid} data-value={article.nid} onClick={self.updateSelectedArticle} to={path} className="list-group-item list-group-item-action">{article.title}</NavLink>);
    //   }
    // });

    return (
      <div className="row top-buffer">
        <div>
          {message}
        </div>
        <div className="col-md-4">
          <form>
            <div className="form-group">
              <input name="keyword"
                value={this.state.keyword}
                onChange={this.updateSearchKeyword}
                type="text"
                className="form-control"
                placeholder="Enter URL to fetch" />
            </div>
          </form>
          <div className="list-group">
            {rows}
          </div><br />
        </div>
        <iframe name="fGrist" src={localStorage.getItem('sourceUrl')} height='250px' width='85%' className="col" />
        <div className="card-block" dangerouslySetInnerHTML={{ __html: c }} />
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

export default BrowserUtil
