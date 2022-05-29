import Boom from '@hapi/boom';
import { mysqlQuery } from '../../db';
/**
 * Get all cities.
 *
 * @returns {Promise}
 */
export const getCities = async () => {
  try {
    const result = await mysqlQuery(`SELECT * FROM cities order by name asc`);

    return result;
  } catch (error) {
    throw Boom.badRequest(error);
  }
};
