import monk from 'monk';
import config from '../../config/config';

/**
  * connect to mongodb
  * @public
  */
const db = monk(config.mongodb.connectionString);
db
  .then((db) => {
    logger.info(`.`);
  })
  .catch((err) => {
    logger.warn(err);
  });

/**
 * Expose `db()`.
 * @return {Connection} db
 * @public
 */
export default db;