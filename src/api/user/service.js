import Boom from '@hapi/boom';
import { mysqlQuery } from '../../db';
import { tokenEncrypt } from '../../utils';

export const login = async (info) => {
  try {
    const checkEmail = `select Id, role, email, password, fullName, phone, 
      address, workDetails, workAddress from user where email = ?`;
    const checkEmailRes = await mysqlQuery(checkEmail, [info.email]);

    if (checkEmailRes.length !== 0) {
      if (checkEmailRes[0].password === info.password) {
        const token = await tokenEncrypt(checkEmailRes[0]);

        delete checkEmailRes[0].password;
        const userDetails = {
          userInfo: checkEmailRes[0],
          token: token
        };

        return userDetails;
      } else {
        throw Boom.unauthorized('Invalid passowrd');
      }
    } else {
      throw Boom.unauthorized('Invalid email');
    }
  } catch (e) {
    throw Boom.badRequest(e);
  }
};

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

export const getProfileInfo = async (userId) => {
  try {
    const getUserDataQ = `select Id, role, email, fullName, phone, 
      address, workDetails, workAddress from user where Id = ?`;
    const getUserDataRes = await mysqlQuery(getUserDataQ, [userId]);

    return getUserDataRes[0];
  } catch (e) {
    throw Boom.badRequest(e);
  }
};

export const setProfileInfo = async (userId, info) => {
  try {
    await mysqlQuery('START TRANSACTION');

    const query = `update user set fullName = ?, phone = ?, address = ?, workDetails = ?, workAddress = ?
      where Id = ?`;
    const result = await mysqlQuery(query, [
      info.fullName,
      info.phone,
      info.address,
      info.workDetails,
      info.workAddress,
      userId
    ]);

    await mysqlQuery('COMMIT');

    return result;
  } catch (e) {
    await mysqlQuery('ROLLBACK');
    throw Boom.badRequest(e);
  }
};
