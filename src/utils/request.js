import axios from 'axios';

/**
 * Make a request.
 *
 * @param obj {String}
 * @param url {String}
 * @param method {String} HTTP verb ('GET', 'POST', 'DELETE', etc.)
 * @param data {String} request body
 * @param callback {Function} to callback on completion
 * @param errback {Function} to callback on error
 */
export default function doRequest(obj, url, method, data, callback, errback) {
  // var auth = localStorage.getItem('auth');
  var csrf = localStorage.getItem('csrf_token');
  var headers = {
    // "Authorization": "Basic " + auth,
    'Access-Control-Allow-Origin': '*',
    'X-CSRF-Token': csrf,
    'Content-Type': 'application/json',
  };
  if (method.toLowerCase() === 'post') {
    obj.serverRequest = axios.post(url, data, {
        headers: headers
      })
      .then(callback)
      .catch(errback);
  } else {
    obj.serverRequest = axios.get(url, data, {
        headers: headers
      })
      .then(callback)
      .catch(errback);
  }
}
export function dataHandler(callback, requestObj){
  
}
