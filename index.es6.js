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
import parse from 'co-body';
import loggerInit from '../config/logger';
import config from '../config/config';
import fs from 'fs';

// import routes from './app/routes';

const app = new koa();

/**
  * koa appication name
  * @public
  */
app.name = 'degg-api';

let logger;

if (app.env === 'development') {
	logger = loggerInit('development');
}
else if (app.env === 'production') {
	logger = loggerInit('production');
}
else {
	logger = loggerInit();
}

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
 * rate limiting -> `ratelimit`
 * routing -> `r`
 * @private
 */
if ('test' != app.env) app.use(convert(Klogger()));
app.use(convert(responseTime()));
app.use(convert(compress()));
app.use(helmet());
// app.use(cors());
app.use(convert(ratelimit({
  db: redis.createClient(),
  max: config.ratelimit.max,
  duration: config.ratelimit.duration
})));

// response middleware

var dbSeed = {
  tobi: { name: 'tobi', species: 'ferret' },
  loki: { name: 'loki', species: 'ferret' },
  jane: { name: 'jane', species: 'ferret' }
};

var pets = {
  list: function *(){
    var names = Object.keys(dbSeed);
    this.body = 'pets: ' + names.join(', ');
  },

  show: function *(name){
    var pet = dbSeed[name];
    if (!pet) return this.throw('cannot find that pet', 404);
    // this.body = pet.name + ' is a ' + pet.species;
    this.body = fs.createReadStream('test.txt')
  }
};

app.use(r.get('/', function *() {
  this.status = 200;
  yield this.body = { message: 'Hello degg-api ¯\\_(ツ)_/¯', status: this.status };
}));

app.use(convert(r.get('/pets', pets.list)));
app.use(convert(r.get('/pets/:name', pets.show)));

// routes(app, `${__dirname}/api`);

// error handlers

app.use(function *(next) {
  try {
    yield* next;
  } catch (err) {
    this.status = err.status || 500;
    this.body = 'oh no! something broke!'
    logger.error(err.stack)
  }
});


/**
 * Expose `api()`.
 * @return {Application}
 * @api public
 */
export default app;
