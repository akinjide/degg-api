import 'babel-polyfill';
import Router from 'koa-better-router';
import userRoutes from './users';

const router = Router().loadMethods();

router.get('/', (ctx, next) => {
  ctx.status = 200;
  ctx.body = { 
    current_url: `https://api.degg.com${ctx.route.path}`,
    message: `degg-api ¯\\_(ツ)_/¯`, 
    status: ctx.status 
  };

  return next();
})

// can use generator middlewares
router.get('/foobar', function * (next) {
  console.log(this.cookies);
  this.body = `Foo Bar Baz! ${this.route.prefix}`
  yield next
});

router.extend(userRoutes);

export default router;