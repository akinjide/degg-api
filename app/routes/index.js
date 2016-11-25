import 'babel-polyfill';
import Router from 'koa-better-router';

import userRoutes from './users';
import authRoutes from './auth';
import statRoutes from './stats';

import HTTPStatus from '../utils/http-status';
import * as Handler from '../utils/handlers';

const router = Router().loadMethods();

router.get('/', function *() {
  this.status = HTTPStatus.OK;
  this.body = yield* Handler.success(this.route.path, `degg-api ¯\\_(ツ)_/¯`, this.status);
});

router.extend(userRoutes);

/**
 * Expose `router`
 *
 * @type {Router} `this` instance for chaining
 * @api private
 */
export { router as default, authRoutes };