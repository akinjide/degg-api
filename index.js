import 'babel-polyfill';
import koa from 'koa';
import Router from 'koa-better-router';
import responseTime from 'koa-response-time';
import compress from 'koa-compress';
import ratelimit from 'koa-ratelimit';
import helmet from 'koa-helmet';
import redis from 'redis';
import Klogger from 'koa-logger';
import convert from 'koa-convert';
import cors from 'kcors';
import morgan from 'koa-morgan';
import FileStreamRotator from 'file-stream-rotator';
import loggerInit from './config/logger';
import config from './config/config';
import fs from 'fs';

import routes from './app/routes';

const app = new koa();
const api = Router({ prefix: '/v1' });

const logDirectory = __dirname + '/logs';
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

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


/**
 * Middlewares.
 * logger -> `Klogger`
 * logger -> `morgan`
 * x-response-time -> `responseTime`
 * compression -> `compress`
 * rate limiting -> `ratelimit`
 * routing -> `api`
 * @private
 */
if ('test' !== app.env) app.use(convert(Klogger()));
app.use(morgan('combined', { stream: accessLogStream }));
app.use(convert(responseTime()));
app.use(convert(compress()));
app.use(convert(function *poweredBy(next) {
  this.set('x-powered-by', 'koa');
  yield* next
}));
app.use(helmet());
app.use(convert(cors({
  origin: '*',
  allowMethods: 'GET, HEAD, POST, OPTIONS, PUT, DELETE',
  allowHeaders: 'Authorization, Origin, Content-Type, Accept',
  credentials: true
})));

if ('build' !== app.env) {
  app.use(convert(ratelimit({
    db: redis.createClient(),
    max: config.ratelimit.max,
    duration: config.ratelimit.duration
  })));
}

// error handlers

app.use(convert(function *(next) {
  try {
    yield next;
  } catch (err) {
    this.status = err.status || 500;
    this.response.body = 'oh no! something broke!'
    logger.error(err.stack)
  }
}));

// response middleware

// add `router`'s routes to api router
api.extend(routes)
app.use(api.middleware());


/**
 * Expose `api()`.
 * @return {Application} app
 * @api public
 */
export default app;
