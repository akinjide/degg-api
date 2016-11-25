import 'babel-polyfill';
import moment from 'moment';
import wrap from 'co-monk';
import parse from 'co-body';
import _ from 'lodash';
import jwt from 'koa-jwt';

import dbConnect from '../utils/connect';
import RequestVerifier from '../utils/request-verifier';
import Hash from '../utils/hash';
import * as Handler from '../utils/handlers';
import {
  default as HTTPStatus,
  code as HTTPCode
} from '../utils/http-status';

const db = dbConnect();
const verify = new RequestVerifier();
const users = wrap(db.get('users'));


export function *create() {
  try {
    const body = yield parse(this);
    const SCHEMA = ['name', 'city', 'password', 'username']
    const error = verify.checkRequestBody(body, SCHEMA);

    if (Object.keys(error).length) {
      this.throw(error, HTTPStatus.FORBIDDEN);
      return;
    }

    const parsedBody = _.pick(body, _.concat(SCHEMA, 'salt'));

    parsedBody.added_at = moment()._d;
    [ parsedBody.salt, parsedBody.password ] = yield Hash.hashPassword(body.password);
    parsedBody.updated_at = undefined;

    const insertedUser = yield users.insert(parsedBody);
    this.set('location', `/user/${insertedUser._id}`);
    this.status = HTTPStatus.CREATED;

    this.body = yield* Handler.success(this.route.path, this.message, this.status);
  } catch(e) {
    this.status = e.status || HTTPStatus.INTERNAL_SERVER_ERROR;
    logger.error(e);
    this.body = yield* Handler.error(this.route.path, this.message, e, this.status);
  }
}


export function *readAll() {
  try {
    const queryFields = verify.checkRequestQuery(this.query.fields, ['id', 'name', 'city', 'username', 'added_at', 'updated_at']);
    const response = yield users.find({}, queryFields );

    this.status = HTTPStatus.OK;
    this.body = _.merge(yield* Handler.success(this.route.path, this.message, this.status), { users: response });
  } catch(e) {
    this.status = e.status || HTTPStatus.INTERNAL_SERVER_ERROR;
    logger.error(e);
    this.body = yield* Handler.error(this.route.path, this.message, e, this.status);
  }
}


export function *readOne(id) {
  try {
    const queryFields = verify.checkRequestQuery(this.query.fields, ['id', 'name', 'city', 'added_at', 'updated_at']);
    const response = yield users.findOne(id, queryFields );

    this.status = HTTPStatus.OK;
    this.body = _.merge(yield* handler.success(this.route.path, this.message, this.status), { user: response });
  } catch (e) {
    this.status = e.status || HTTPStatus.INTERNAL_SERVER_ERROR;
    logger.error(e);
    this.body = yield* Handler.error(this.route.path, this.message, e, this.status);
  }
}


export function *updateOne(id) {
  const body = yield parse(this);

  body.updated_at = moment();
  this.status = HTTPStatus.NO_CONTENT;
  yield users.update(id, body);
  this.set('location', `/user/${id}`);
  this.body = HTTPCode[204];
}


export function *removeOne(id) {
  this.status = HTTPStatus.NO_CONTENT;
  this.body = yield users.findOneAndDelete({ _id: id });
}


export default function *error() {
  this.status = HTTPStatus.METHOD_NOT_ALLOWED;
  this.body = yield* Handler.error(this.route.path, this.message, `${this.method} request method specified is not allowed for the requested resource.`, this.status);
}
