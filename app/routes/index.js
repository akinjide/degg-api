import 'babel-polyfill';
import Router from 'koa-better-router';

import users from './users';
import auths from './auth';
import stats from './stats';

import HTTPStatus from '../utils/http-status';
import * as Handler from '../utils/handlers';

const router = Router();

router.addRoute('GET', '/', function *() {
  this.status = HTTPStatus.OK;
  this.body = yield* Handler.success(this.route.path, `degg-api ¯\\_(ツ)_/¯`, this.status);
});


/**
 * Expose `router`
 *
 * @type {Router} `this` instance for chaining
 * @api private
 */
export { router as default, users, auths, stats };