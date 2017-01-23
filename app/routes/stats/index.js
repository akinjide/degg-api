import 'babel-polyfill';
import Router from 'koa-better-router';
import { stats, logs } from '../../controllers/stats';
import { hasAuthorization } from '../../middlewares/authorization';

const router = Router().loadMethods();

/**
 * Resources
 *
 * read -> GET
 */

/**
 *
 * Route
 * /stats
 * /logs
 *
 * @api private
 */
router.get('/stats', hasAuthorization(['admin', 'user']), stats);
router.get('/stats/logs', hasAuthorization(['admin', 'user']), logs);

export default router;
