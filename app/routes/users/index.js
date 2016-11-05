import 'babel-polyfill';
import Router from 'koa-better-router';
import { create as addUser, readAll as getUsers } from '../../controllers/users';

const router = Router().loadMethods();

router.post('/users', addUser);
router.get('/users', getUsers);

export default router;