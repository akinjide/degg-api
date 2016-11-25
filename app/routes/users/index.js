import 'babel-polyfill';
import Router from 'koa-better-router';

import {
  create as addUser,
  readAll as getUsers,
  readOne as getUser,
  updateOne as updateUser,
  removeOne as deleteUser,
  default as error
} from '../../controllers/users';

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
router.post('/users', addUser);
router.get('/users', getUsers);
router.put('/users', error); // should throw error // bulk update /users
// router.delete('/users', deleteUsers);

/**
 *
  * Route
 * /Users/:id
 *
 * @api private
 */
router.post('/users/:id', error); // should throw error
router.get('/users/:id', getUser);
router.put('/users/:id', updateUser); // should update if exists else throw error
router.del('/users/:id', deleteUser);

export default router;