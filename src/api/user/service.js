import Boom from '@hapi/boom';
import axios from 'axios';
import NodeGeocoder from 'node-geocoder';
import { mysqlQuery } from '../../db';
import { tokenEncrypt } from '../../utils';

const config = process.env;

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

export const getTransactionDetails = async (info) => {
  try {
    if (info.readType === 'Booking') {
      try {
        const blockChainRes = await axios.get(`${config.BLOCKCHAIN_URL}/getTxCB?TxID=${info.transactionHash}`);

        if (blockChainRes.data.StatusCode === 200) {
          const consumerIdQ = await mysqlQuery(`select consumerNo, machineId from booking where Id = ?`, [
            blockChainRes.data.Receipt.value.booking_id
          ]);
          const ownerIdQ = await mysqlQuery(`select ownerId from equipments where Id = ?`, [consumerIdQ[0].machineId]);

          blockChainRes.data.Receipt.value.consumer_id = consumerIdQ[0].consumerNo;
          blockChainRes.data.Receipt.value.owner_id = ownerIdQ[0].ownerId;

          return blockChainRes.data.Receipt;
        } else {
          throw Boom.badRequest('Invalid transaction hash');
        }
      } catch (error) {
        throw Boom.badRequest(error);
      }
    }

    if (info.readType === 'Invoice') {
      try {
        const blockChainRes = await axios.get(`${config.BLOCKCHAIN_URL}/getTxCI?TxID=${info.transactionHash}`);

        if (blockChainRes.data.StatusCode === 200) {
          const consumerIdQ = await mysqlQuery(`select consumerNo, machineId from booking where Id = ?`, [
            blockChainRes.data.Receipt.value.booking_id
          ]);
          const ownerIdQ = await mysqlQuery(`select ownerId from equipments where Id = ?`, [consumerIdQ[0].machineId]);

          blockChainRes.data.Receipt.value.consumer_id = consumerIdQ[0].consumerNo;
          blockChainRes.data.Receipt.value.owner_id = ownerIdQ[0].ownerId;

          return blockChainRes.data.Receipt;
        } else {
          throw Boom.badRequest('Invalid transaction hash');
        }
      } catch (error) {
        throw Boom.badRequest(error);
      }
    }
  } catch (e) {
    throw Boom.badRequest(e);
  }
};

export const getAddressFromLatLng = async (info) => {
  try {
    const geocoder = NodeGeocoder({
      provider: 'google',
      apiKey: config.googleMatrixAPIKey
    });
    let address = null;

    const res = await geocoder.reverse({ lat: info.lat, lon: info.lng });

    address = res[0].formattedAddress;
    const countryFind = address.split(' ');
    const country = countryFind[countryFind.length - 1];

    if (address !== null) {
      if (country === 'Denmark' && countryFind.length > 1) {
        return address;
      } else {
        throw Boom.badRequest('Invalid address');
      }
    } else {
      throw Boom.badRequest('Invalid address');
    }
  } catch (e) {
    throw Boom.badRequest(e);
  }
};
