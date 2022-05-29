import util from 'util';
import mysql from 'mysql';
import config from './knexfile';

/**
 * Database connection.
 */
const pool = mysql.createPool(config.connection);

export const mysqlQuery = util.promisify(pool.query).bind(pool);
