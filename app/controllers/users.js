import 'babel-polyfill';
import db from '../utils/connect';
import wrap from 'co-monk';
import parse from 'co-body';
import RequestVerifier from '../utils/request-verifier';

const verify = new RequestVerifier();

console.log(verify.checkRequestBody);

const users = wrap(db.get("users"));

/**
 * Expose response default.
 * @param {String} path
 * @param {String} message
 * @param {String} status
 * @return {Object}
 * @api private
 */
function *Handler(path, message, status) {
  return {
    current_url: `https://api.degg.com${path}`,
    message: `${message}`,
    status: status
  }
}


export function *create(next) {
  var body = yield parse(this);
  const error = verify.checkRequestBody(body, ['name', 'city']);

  if (Object.keys(error).length) {
    this.throw(403, 'access_denied', error);
  }
  else {
    var insertedUser = yield users.insert(body);
    this.set('location', "/user/" + insertedUser._id);
    this.status = 201;
    this.body = yield* Handler(this.route.path, this.message, this.status);
  }

  // { 
  //   current_url: `https://api.degg.com${this.route.path}`,
  //   message: `${this.message}`, 
  //   status: this.status
  // };
}

export function *readAll(next) {
  const res = yield users.find({});
  this.status = 200;
  this.body = Object.assign({}, yield* Handler(this.route.path, this.message, this.status), { users: res });
  // { 
  //   current_url: `https://api.degg.com${this.route.path}`,
  //   message: `${this.message}`, 
  //   status: this.status,
  //   users: res
  // };
}