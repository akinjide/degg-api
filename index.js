import 'babel-polyfill';
import koa from 'koa';
import r from 'koa-route';
import responseTime from 'koa-response-time';
import compress from 'koa-compress';
import ratelimit from 'koa-ratelimit';
import helmet from 'koa-helmet';
import redis from 'redis';
import Klogger from 'koa-logger';
import convert from 'koa-convert';
import cors from 'kcors';
import wrap from 'co-monk';
import monk from 'monk';
import loggerInit from './config/logger';
import config from './config/config';
import fs from 'fs';

const app = new koa();

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

/**
  * connect to mongodb
  * @private
  */
const db = monk(config.mongodb.connectionString);
db.then(() => {
  logger.info(`Connected correctly to DB server :).. Have a [̲̅$̲̅(̲̅5̲̅)̲̅$̲̅] bill!`);
});


/**
 * Middlewares.
 * logger -> `Klogger`
 * x-response-time -> `responseTime`
 * compression -> `compress`
 * headers -> `helmet`
 * cross origin resource -> `cors`
 * rate limiting -> `ratelimit`
 * routing -> `r`
 * @private
 */
if ('test' != app.env) app.use(convert(Klogger()));
app.use(convert(responseTime()));
app.use(convert(compress()));
app.use(helmet());
app.use(convert(cors({
  origin: '*',
  allowMethods: 'GET, HEAD, POST, OPTIONS, PUT, DELETE',
  allowHeaders: 'Authorization, Origin, Content-Type, Accept',
  credentials: true
})));
app.use(convert(ratelimit({
  db: redis.createClient(),
  max: config.ratelimit.max,
  duration: config.ratelimit.duration
})));

// response middleware

app.use(r.get('/', function *() {
  this.status = 200;
  this.body = { message: `Hello degg-api ¯\_(ツ)_/¯`, status: this.status };
}));


// routes(app, `${__dirname}/api`);


/**
 * Expose `api()`.
 * @return {Application} app
 * @api public
 */
export default app;
