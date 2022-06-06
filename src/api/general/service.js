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
    const reciept = {
      RPC_endpoint: 'localhost:8080',
      txid: '0x25805ed1fa007e9e9a42b49eee4545533f538b0965cf289ef27afdcaa4808b5a',
      Contract_address: '0xDd8aB405D0083cACD2563E8Edc162BE3BaEbB340',
      From: '0x26ac5cD5fb34d468a25ab46fE774A3e8E81A4591',
      Transaction_fees: 0,
      Block_number: 1463,
      timestamp: Date.now() / 1000,
      Data: '0xc07c3da60000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001',
      channel_id: '',
      key: '2',
      value: {},
      is_delete: ''
    };

    if (info.readType === 'Booking') {
      try {
        const consumerIdQ = await mysqlQuery(`select * from booking where transactionHash = ?`, [info.transactionHash]);
        const ownerIdQ = await mysqlQuery(`select ownerId from equipments where Id = ?`, [consumerIdQ[0].machineId]);
        const consumerBooking = consumerIdQ[0];
        const consumerHashJson = JSON.parse(consumerBooking.hashJson);

        const ownerBooking = ownerIdQ[0];

        reciept.txid = info.transactionHash;

        reciept.value.consumer_id = consumerBooking.consumerNo;
        reciept.value.owner_id = ownerBooking.ownerId;

        reciept.value.booking_id = consumerHashJson.bookingId;
        reciept.value.machine_id = consumerHashJson.machineId;
        reciept.value.start_date = consumerHashJson.startDate;
        reciept.value.end_date = consumerHashJson.endDate;
        reciept.value.machine_location = consumerHashJson.machineLocation;

        return reciept;
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
      apiKey: config.GOOGLE_MATRIX_API_KEY
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
