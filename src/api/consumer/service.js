import { mysqlQuery } from '../../db';
import moment from 'moment';
import Boom from '@hapi/boom';
import axios from 'axios';
// import logger from '../../utils/logger';
// import HttpStatus from 'http-status-codes';

const config = process.env;

export const checkAvailability = async (info) => {
  try {
    // const changedDate = moment(new Date(info.startDate)).format('YYYY-MM-DD');
    // const newDate = moment(changedDate, 'YYYY-MM-DD').add(info.totalDays, 'days');
    // const day = newDate.format('DD');
    // const month = newDate.format('MM');
    // const year = newDate.format('YYYY');
    // const finalDate = moment(new Date(year + '-' + month + '-' + day)).format('YYYY-MM-DD');

    const totalCountQ = await mysqlQuery(
      `SELECT EQ.Id, EQ.equipmentName, EQ.equipmentWeight, EQ.edition, EQ.serialNumber, TY.machineType , ST.equipmentStatus, CT.name as location from equipments EQ 
      left join equipmenttype TY on EQ.equipmentType = TY.Id
      left join equipmentstatus ST on EQ.status = ST.Id
      left join cities CT on CT.Id = EQ.locationAddress 
      where EQ.equipmentType = ? 
      and EQ.status = 1
      order by Id desc`,
      [info.machineType]
    );
    const totalPages = Math.ceil(totalCountQ.length / info.itemsPerPage);

    if (info.page > totalPages) {
      return {
        totalPages: totalPages,
        availableMachines: []
      };
    }

    const limit = (info.page - 1) * info.itemsPerPage;
    const offset = info.itemsPerPage;

    const checkAvailabilityQ = `SELECT EQ.Id, EQ.equipmentName, EQ.equipmentWeight, EQ.edition, EQ. equipmentType, EQ.serialNumber, 
      EQ.levelOfCondition, EQ.imageName, TY.machineType , ST.equipmentStatus, CT.lat, CT.lng, CT.name as location from equipments EQ 
      left join equipmenttype TY on EQ.equipmentType = TY.Id
      left join equipmentstatus ST on EQ.status = ST.Id
      left join cities CT on EQ.locationAddress = CT.Id
      where EQ.equipmentType = ?
      and EQ.status = 1
      order by Id desc`;
    const checkAvailabilityR = await mysqlQuery(checkAvailabilityQ, [info.machineType]);

    if (checkAvailabilityR.length === 0) {
      const getTypeQ = await mysqlQuery(`select machineType from equipmenttype where Id = ?`, [info.machineType]);

      throw Boom.badRequest(`${getTypeQ[0].machineType} are currently  not available for booking`);
    }

    const distance = 100;

    // ----------HERE CALCUALTE TOTAL COSTING USING GOOLE DISTANCE API BASED UPOMN FOLLOWING =>
    // TOTAL NO OF DAYS * RATE PER DAY + TOTAL DISTANCE * PER KM RATE + TOTAL WEIGHT * RATE PER KG
    // eslint-disable-next-line no-await-in-loop
    const daysCostArray = await Promise.all(
      checkAvailabilityR.map((obj) =>
        mysqlQuery(`select ratePerDay, ratePerKm, ratePerKg from equipmentrates where equipmentId = ?`, [
          obj.equipmentType
        ])
      )
    );

    checkAvailabilityR.map((obj, idx) => {
      const rate = daysCostArray[idx][0].ratePerDay;
      const rateKm = daysCostArray[idx][0].ratePerKm;
      const rateKg = daysCostArray[idx][0].ratePerKg;
      const daysCost = info.totalDays * rate;

      const distanceCost = Number(distance) * rateKm;
      const transportCost = obj.equipmentWeight * 1000 * rateKg;

      obj.totalCost = Math.round(daysCost + distanceCost + transportCost);
    });

    if (checkAvailabilityR.length === 1) {
      return {
        totalPages: totalPages,
        availableMachines: checkAvailabilityR
      };
    }
    const sortedDistances = checkAvailabilityR.sort((a, b) => {
      return a.totalCost - b.totalCost;
    });

    const finalData = sortedDistances.splice(limit, offset);

    return {
      totalPages: totalPages,
      availableMachines: finalData
    };
  } catch (e) {
    throw Boom.badRequest(e);
  }
};

// eslint-disable-next-line no-unused-vars
const distanceCal = (o, d) => {
  return new Promise((resolve, reject) => {
    const distance = require('google-distance');

    distance.apiKey = config.GOOGLE_MATRIX_API_KEY;
    distance.get(
      {
        origin: o,
        destination: d
      },
      function (err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      }
    );
  });
};

export const getBookings = async (info, consumerId) => {
  try {
    const totalCountQ = await mysqlQuery(
      `SELECT BK.Id, BK.startDate, BK.endDate, EQ.serialNumber, BK.equipmentType, BK.transactionHash, BK.invoiceAmount 
      FROM booking BK 
      left join equipments EQ on BK.machineId = EQ.Id
      where BK.consumerNo = ?`,
      [consumerId]
    );
    const totalPages = Math.ceil(totalCountQ.length / info.itemsPerPage);

    const limit = (info.page - 1) * info.itemsPerPage;
    const offset = info.itemsPerPage;

    const getBookingsQ = `SELECT BK.Id, BK.startDate, BK.endDate, EQ.serialNumber,  EQ.equipmentName, EQ.imageName,
      EQ.levelOfCondition, EQ.equipmentWeight, EQ.edition, CT.name as location,  BK.equipmentType, BK.transactionHash, BK.invoiceAmount 
      FROM booking BK 
      left join equipments EQ on BK.machineId = EQ.Id
      left join cities CT on CT.Id = EQ.locationAddress 
      where BK.consumerNo = ?
      order by Id desc
      limit ${limit}, ${offset}`;
    const getBookingsR = await mysqlQuery(getBookingsQ, [consumerId]);

    return {
      totalPages: totalPages,
      bookingsList: getBookingsR
    };
  } catch (e) {
    throw Boom.badRequest(e);
  }
};
export const getInvoice = async (info, consumerId) => {
  try {
    const totalCountQ = await mysqlQuery(
      `select INV.Id, INV.bookingId, INV.invoiceAmount, INV.transactionHash, 
      EQ.serialNumber, TY.machineType
      from invoice INV
      left join equipments EQ on INV.machineId = EQ.Id
      left join equipmentType TY on TY.Id = EQ.equipmentType
      left join booking BK on INV.bookingId = BK.Id
      where BK.consumerNo = ?
      order by bookingId asc`,
      [consumerId]
    );
    const totalPages = Math.ceil(totalCountQ.length / info.itemsPerPage);

    const limit = (info.page - 1) * info.itemsPerPage;
    const offset = info.itemsPerPage;

    const getBookingsQ = `select INV.Id, INV.bookingId, INV.invoiceAmount, INV.transactionHash, 
      EQ.serialNumber, TY.machineType as equipmentType 
      from invoice INV
      left join equipments EQ on INV.machineId = EQ.Id
      left join equipmentType TY on TY.Id = EQ.equipmentType
      left join booking BK on INV.bookingId = BK.Id
      where BK.consumerNo = ?
      order by Id desc
      limit ${limit}, ${offset}`;
    const getBookingsR = await mysqlQuery(getBookingsQ, [consumerId]);

    return {
      totalPages: totalPages,
      invoiceList: getBookingsR
    };
  } catch (e) {
    throw Boom.badRequest(e);
  }
};
export const createBooking = async (info, consumerId) => {
  try {
    let startDate = moment(new Date(info.startDate)).format('DD-MM-YYYY');

    startDate = moment(startDate, 'DD-MM-YYYY').add(info.totalDays, 'days');
    const day = startDate.format('DD');
    const month = startDate.format('MM');
    const year = startDate.format('YYYY');
    const endDate = year + '-' + month + '-' + day;

    startDate = moment(new Date(info.startDate)).format('YYYY-MM-DD');
    const getEqType = await mysqlQuery(
      `SELECT equipmenttype.machineType, CT.name FROM equipments
      left join equipmenttype on equipments.equipmentType = equipmenttype.Id
      left join cities CT on equipments.locationAddress = CT.Id
      where equipments.Id = ?`,
      [info.machineId]
    );

    const insertBookingQ = await mysqlQuery(
      `insert into booking (machineId, startDate, endDate, equipmentType, 
         invoiceAmount, consumerNo) 
        values (?,?,?,?,?,?)`,
      [info.machineId, startDate, endDate, getEqType[0].machineType, info.totalAmount, consumerId]
    );
    const bId = insertBookingQ.insertId;
    // var transactionHash = "0xd48f8a896d8ff6241c1fe16937d6da6876daaafae916b83f3cfd5507f741feb7";
    let transactionHash = null;

    try {
      const blockChainRes = await axios.post('http://localhost:8545/writeBooking', {
        BookingId: bId.toString(), // `${bId}`
        machineId: info.machineId.toString(), // `${info.machineId}`
        startDate: moment(new Date(startDate)).format('MM-DD-YYYY').toString(),
        endDate: moment(new Date(endDate)).format('MM-DD-YYYY').toString(),
        machineLocation: getEqType[0].name.toString() // `${getEqType[0].name}`
      });

      transactionHash = blockChainRes.data.Hash;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }

    await mysqlQuery(`update booking set transactionHash = ? where Id = ?`, [transactionHash, bId]);
    // -------------update equipment status to occupied ie 2
    await mysqlQuery(`update equipments set status = 2 where Id = ?`, [info.machineId]);
    // send booking id in response

    return { orderId: insertBookingQ.insertId };
  } catch (e) {
    throw Boom.badRequest(e);
  }
};

export const dashboardAPI = async (consumerId) => {
  try {
    const getBookingsQ = `SELECT BK.Id as bookingId, BK.startDate, BK.endDate, EQ.serialNumber, EQ.equipmentName,  BK.equipmentType, BK.transactionHash, BK.invoiceAmount 
      FROM booking BK 
      left join equipments EQ on BK.machineId = EQ.Id
      where BK.consumerNo = ? and BK.startDate >= curdate()
      order by BK.Id desc
      limit 10`;
    const getBookingsR = await mysqlQuery(getBookingsQ, [consumerId]);

    const getMonth = await mysqlQuery(`select month(curdate()) as name, 
      dayofmonth(LAST_DAY(concat(year(curDate()), "-", month(curDate()), "-", "05"))) as totalDays,
      year(curdate()) as year`);
    const month = getMonth[0].name; // 12
    const days = getMonth[0].totalDays; // 31
    const year = getMonth[0].year; // 2020
    const startDate = year + '-' + month + '-' + '01';
    const endDate = year + '-' + month + '-' + days;

    const getAllDaysForMonth =
      await mysqlQuery(`SELECT '${startDate}' + INTERVAL t.n - 1 DAY as date, (select 0) as frequency
        FROM tally t
       WHERE t.n <= DATEDIFF(LAST_DAY('${endDate}'), '${startDate}') + 1`);

    const dataForMonthArray = await Promise.all(
      getAllDaysForMonth.map((obj) =>
        mysqlQuery(
          `SELECT count(*) as count FROM booking BK 
      left join equipments EQ on BK.machineId = EQ.Id
      where BK.consumerNo = ? and date(BK.createdAt) = ?`,
          [consumerId, obj.date]
        )
      )
    );

    getAllDaysForMonth.map((el, idx) => {
      el.frequency = dataForMonthArray[idx][0].count;
    });

    return {
      upcomingBookings: getBookingsR,
      bookingsGraph: getAllDaysForMonth
    };
  } catch (e) {
    throw Boom.badRequest(e);
  }
};
