import routerModule from 'koa-router';

const router = routerModule();

router.get('/', function *(next) {
	yield this.body = 'degg-api ¯\_(ツ)_/¯'
});

export default router;
