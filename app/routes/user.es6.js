import routerModule from 'koa-router';
import parse from 'co-body';

const router = routerModule();

router.post('/', function *(next) {
	console.log(this);
	yield this.render('index', {
		title: 'degg-api ¯\_(ツ)_/¯'
	});
});

export default router;
