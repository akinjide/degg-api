import 'babel-polyfill';
import Router from 'koa-better-router';
import { stats, logs } from '../../controllers/stats';

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
router.get('/stats', stats);
router.get('/stats/logs', logs);

export default router;