import 'babel-polyfill';
import moment from 'moment';
import wrap from 'co-monk';
import parse from 'co-body';
import _ from 'lodash';

import dbConnect from '../utils/connect';
import RequestVerifier from '../utils/request-verifier';
import Hash from '../utils/hash';
import supRoutes from '../utils/supported-routes';
import * as Token from '../utils/token';
import * as Handler from '../utils/handlers';
import {
  default as HTTPStatus,
  code as HTTPCode
} from '../utils/http-status';

const db = dbConnect();
const verify = new RequestVerifier();
const users = wrap(db.get('users'));


export function *bearer() {
  try {
    const body = yield parse(this);

    const SCHEMA = ['username', 'password']
    const error = verify.checkRequestBody(body, SCHEMA);

    if (Object.keys(error).length) {
      this.throw(error, HTTPStatus.UNAUTHORIZED);
      return;
    }

    const user = yield users.findOne({ username: body.username });

    if (user) {
      const validPassword = yield Hash.isPassword(body.password, user.password);
      if (!validPassword) {
        this.throw(HTTPCode[401], HTTPStatus.UNAUTHORIZED);
      } else {
        // Remove sensitive data before login
        user.salt = undefined;
        user.password = undefined;

        const access_token = yield Token.issueToken(user);

        this.status = HTTPStatus.OK;
        this.set('X-OAuth-Scopes', 'users');
        this.body = _.merge(yield* Handler.success(this.route.path, this.message, this.status),
        {
          access_token: access_token,
          scope: 'users',
          token_type: 'bearer'
        });
      }
    } else {
      this.throw(HTTPCode[401], HTTPStatus.UNAUTHORIZED);
    }

    // this.body = `Foo Bar Baz! ${this.route.prefix}`

  } catch(e) {
    this.status = e.status || HTTPStatus.INTERNAL_SERVER_ERROR;
    logger.error(e);
    this.body = yield* Handler.error(this.route.path, this.message, 'Bad credentials', this.status);

  }
}


export function *basic() {
  if (this.header.authorization) {
    const parts = _.split(this.header.authorization, /\s+/);
    // 'Basic dGo6ZmU='
    if (parts.length == 2) {
      const scheme = parts[0];
      const encoded = parts[1];

      if (/^Basic$/i.test(scheme)) {
        const decoded = new Buffer(encoded, 'base64').toString();

        const credentials = _.split(decoded, /:/);
        const username = credentials[0];
        const password = credentials[1];

        const user = yield users.findOne({ username: username });

        if (user) {
          const validPassword = yield Hash.isPassword(password, user.password);

          if (!validPassword) {
            this.throw(HTTPCode[401], HTTPStatus.UNAUTHORIZED);
          } else {
            console.log(user, password);
          }
        }

        // app.context.user = { name: username, pass: password };
        this.body = 'success';
        // this.status = 301;
        // this.redirect('/v1/users');
      }
    } else {
      this.throw('Bad credentials\n', 401);
    }
  } else {
    this.body = supRoutes;
  }
}

