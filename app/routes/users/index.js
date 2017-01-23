import 'babel-polyfill';
import Router from 'koa-better-router';

import {
  create as addUser,
  readAll as getUsers,
  readOne as getUser,
  updateOne as updateUser,
  updateMany as updateUsers,
  removeOne as deleteUser,
  removeMany as deleteUsers,
  default as error
} from '../../controllers/users';
import { hasAuthorization } from '../../middlewares/authorization';

const router = Router().loadMethods();


/**
 * Resources
 *
 * create -> POST
 * read -> GET
 * update -> PUT
 * delete -> DELETE
 */

/**
 *
 * Route
 * /Users
 *
 * @api private
 */
router.post('/register', addUser);
router.post('/users', addUser);
router.get('/users', getUsers);
router.put('/users', updateUsers); // bulk update /users
router.delete('/users', deleteUsers); // bulk remove /users

/**
 *
  * Route
 * /Users/:id
 *
 * @api private
 */
router.post('/users/:id', error); // should throw error
router.get('/users/:id', getUser);
router.put('/users/:id', hasAuthorization(['users', 'admin']), updateUser); // should update if exists else throw error
router.del('/users/:id', hasAuthorization(['users', 'admin']), deleteUser);

export default router;
