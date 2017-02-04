import 'babel-polyfill';
import Koa from 'koa';
import Router from 'koa-better-router';
import responseTime from 'koa-response-time';
import compress from 'koa-compress';
import ratelimit from 'koa-ratelimit';
import helmet from 'koa-helmet';
import redis from 'redis';
import Klogger from 'koa-logger';
import convert from 'koa-convert';
import morgan from 'koa-morgan';
import FileStreamRotator from 'file-stream-rotator';
import fs from 'fs';
import jwt from 'koa-jwt';
import session from 'koa-session';
import conditional from 'koa-conditional-get';
import etag from 'koa-etag';
import mount from 'koa-mount';
import bAuth from 'koa-basic-auth';
import _ from 'lodash';
import zlib from 'zlib';

import configurator from './config/config';
import loggerInit from './config/logger';
import {
  default as routes,
  users,
  auth,
  stats
} from './app/routes';
import * as Handler from './app/utils/handlers';
import {
  default as HTTPStatus,
  code as HTTPCode
} from './app/utils/http-status';


const app = new Koa();

// routes prefixes
const api = Router({ prefix: 'v1' });

const environment = process.env.NODE_ENV || app.env || 'development';
const config = configurator(environment);

app.keys = [...config.secretKeys];

const logDirectory = __dirname + '/logs';

try {
  fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
} catch(e) {
  logger.error(e);
}

const accessLogStream = FileStreamRotator.getStream({
  date_format: 'YYYYMMDD',
  filename: logDirectory + '/access-%DATE%.log',
  frequency: 'weekly',
  verbose: false
});


/**
  * koa appication name
  * @public
  */
app.name = 'degg-api';

const logger = app.env
  ? loggerInit(app.env)
  : loggerInit();

global.logger = logger;
logger.info(`Application starting....`);
logger.debug(`Overriding \'Express\' logger`);
logger.info(`Connected correctly to server :).. Have a [̲̅$̲̅(̲̅5̲̅)̲̅$̲̅] bill!`);
logger.info('NODE_ENV=' + environment);

// error handler
app.use(convert(function *(next) {
  try {
    yield next;
    if (HTTPStatus.NOT_FOUND == this.status && !this.body) {
      this.throw(HTTPStatus.NOT_FOUND);
    }
  } catch (err) {
    this.status = err.status || HTTPStatus.INTERNAL_SERVER_ERROR;

    if (HTTPStatus.UNAUTHORIZED == this.status) {
      this.set('WWW-Authenticate', 'Basic, Bearer');
      this.set('Status', `${HTTPStatus.UNAUTHORIZED} Unauthorized`);
      this.message = 'Protected resource, use Authorization header to get access.';
    }

    const message = (err.message) ? err.message : `oh no! something broke!`;
    const path = (this.route) ? this.route.path : this.url;

    this.body = yield* Handler.error(path, this.message, message, this.status);
    // logger.error(err.stack)
  }
}));


/**
 * Middlewares.
 *
 * Klogger, session
 * morgan, responseTime
 * compress, poweredBy
 * helmet, conditional
 * etag, CORS
 * ratelimit, JWT
 * routing -> `api`
 *
 * @private
 */
if ('test' !== environment) {
  app.use(convert(Klogger()));
}

app.use(convert(session(app)));
app.use(morgan('combined', { stream: accessLogStream }));
app.use(convert(responseTime()));
app.use(compress({
  flush: zlib.Z_SYNC_FLUSH
}));
app.use(convert(function *poweredBy(next) {
  this.set('x-powered-by', 'koa');
  this.set('degg-api-version', 'v1');
  yield* next
}));
app.use(helmet());
app.use(convert(conditional()));
app.use(etag());
app.use(convert(function *cors(next) {
  this.set('Access-Control-Allow-Origin', '*');
  this.set('Access-Control-Expose-Headers', 'ETag, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset');
  this.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  this.set('Access-Control-Allow-Credentials', true);
  this.set('Access-Control-Allow-Headers', 'Authorization, Origin, Content-Type, Accept');
  // this.set('Access-Control-Max-Age', options.maxAge);

  if (this.method === 'OPTIONS') {
    this.status = HTTPStatus.NO_CONTENT;
  } else {
    yield next;
  }
}));

if ('test' !== environment) {
  app.use(convert(ratelimit({
    db: redis.createClient(config.REDISURL),
    max: config.ratelimit.max,
    duration: config.ratelimit.duration
  })));
}

app.use(convert(jwt({
    secret: config.secret,
    issuer: 'https://api.degg.com',
    subject: 'degg_token',
    debug: false,
    passthrough: false,
    getToken: function fromHeaderOrQuerystring() {
      const queryToken = this.query.access_token;

      if (this.header.authorization) {
        const parts = _.split(this.header.authorization, ' ');

        if (_.eq(parts.length, 2)) {
          const scheme = parts[0];
          const credentials = parts[1];

          if (/^Bearer$/i.test(scheme)) {
            return credentials;
          }
        } else {
          this.throw(HTTPStatus.UNAUTHORIZED, 'Bad Authorization header format. Format is "Authorization: Bearer <token>"\n');
        }
      } else if (this.query && queryToken) {
        const path = _.split(this.url, '?');
        this.url = path[0];

        return queryToken;
      }

      return null;
    }
  })
  .unless({
    path: ['/', '/v1/register', '/v1/authenticate'],
  }))
);

// add `router`'s routes to api router
api
  .extend(routes)
  .extend(users)
  .extend(stats)
  .extend(auth);
app.use(api.middleware());


/**
 * Expose `api()`.
 * @return {Application} app
 * @api public
 */
export default app;
