import Boom from '@hapi/boom';
import axios from 'axios';
import { mysqlQuery } from '../../db';
import HttpStatus from 'http-status-codes';
import path from 'path';
import fs from 'fs'

export const getMachineType = async () => {
  try {
    const getMachinesQ = `SELECT * FROM equipmenttype order by machineType asc`;
    const getMachinesR = await mysqlQuery(getMachinesQ);

    return getMachinesR;
  } catch (e) {
    throw Boom.badRequest(e);
  }
};
export const getMachineStatus = async () => {
  try {
    const getMachinesQ = `SELECT * FROM equipmentstatus`;
    const getMachinesR = await mysqlQuery(getMachinesQ);

    return getMachinesR;
  } catch (e) {
    throw Boom.badRequest(e);
  }
};
export const addNewMachine = async (info, ownerId) => {
  try {
    await mysqlQuery('START TRANSACTION');
    const chkQ = await mysqlQuery(`select serialNumber from equipments where serialNumber = ?`, [info.serialNumber]);

    if (chkQ.length === 0) {
      const addMachineQ = `insert into equipments (equipmentName, equipmentWeight, edition, serialNumber, status, equipmentType, ownerId, locationAddress, levelOfCondition, imageName) 
        values (?,?,?,?,?,?,?,?,?,?)`;
      const getMachinesR = await mysqlQuery(addMachineQ, [
        info.equipmentName,
        info.equipmentWeight,
        info.edition,
        info.serialNumber,
        info.status,
        info.equipmentType,
        ownerId,
        info.cityId,
        info.levelOfCondition,
        info.imageName
      ]);

      await mysqlQuery('COMMIT');

      return getMachinesR;
    } else {
      await mysqlQuery('COMMIT');
      throw Boom.badRequest('Machine already exists');
    }
  } catch (e) {
    await mysqlQuery('ROLLBACK');
    throw Boom.badRequest(e);
  }
};

export const editMachine = async (info, ownerId) => {
  try {
    await mysqlQuery('START TRANSACTION');
    const checkStatus = await mysqlQuery(`SELECT status, imageName FROM equipments where Id = ?`, [info.Id]);

    if (Number(checkStatus[0].status) === 1 && Number(info.status) === 2) {
      throw Boom.badRequest('cannot update free status to occupied status manually');
    }
    if (Number(checkStatus[0].status) === 2) {
      const getBookingData = await mysqlQuery(
        `select Id, machineId, startDate, endDate, createdAt, equipmentType, transactionHash,
        invoiceAmount from booking where machineId = ? 
        order by createdAt desc
        limit 1`,
        [info.Id]
      );
      const insertInvoice = await mysqlQuery(
        `insert into invoice (bookingId, invoiceAmount,  machineId)
        values (?,?,?)`,
        [getBookingData[0].Id, getBookingData[0].invoiceAmount, getBookingData[0].machineId]
      );
      const invoiceId = insertInvoice.insertId;
      let transactionHash = null;

      try {
        const amt = Number(getBookingData[0].invoiceAmount).toLocaleString();
        const blockChainRes = await axios.post('http://localhost:8545/writeInvoice', {
          InvoiceId: invoiceId.toString(), // `${invoiceId}`
          BookingId: getBookingData[0].Id.toString(), // `${getBookingData[0].Id}`
          Amount: `Kr ${amt}`
        });

        transactionHash = blockChainRes.data.Hash;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
      }
      await mysqlQuery(`update invoice set transactionHash = ? where Id = ?`, [transactionHash, invoiceId]);

      const updateMachineQ = `update equipments set equipmentName = ?,
        equipmentWeight = ?, edition = ?, serialNumber = ?, 
        status = ?, equipmentType = ?,  locationAddress = ?, levelOfCondition = ?, imageName = ?
        where ownerId = ? and Id = ?`;
      const getMachinesR = await mysqlQuery(updateMachineQ, [
        info.equipmentName,
        info.equipmentWeight,
        info.edition,
        info.serialNumber,
        info.status,
        info.equipmentType,
        info.cityId,
        info.levelOfCondition,
        info.imageName,
        ownerId,
        info.Id
      ]);

      // -------------DELETE OLD IMAGE IF NEW IMAGE IS UPLOADED-------------------------------------------------------
      if (checkStatus[0].imageName !== info.imageName) {

        try {
          fs.unlinkSync(path.join(__dirname, '../../../', `/public/machineImages/${checkStatus[0].imageName}`));
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log(error);
        }
        fs.unlinkSync();
      }
      await mysqlQuery('COMMIT');

      return {
        code: HttpStatus.OK,
        message: `Invoice ${invoiceId} generated successfully, for more details on Invoice check in the invoice section`,
        data: getMachinesR
      };
    } else {
      const updateMachineQ = `update equipments set equipmentName = ?,
          equipmentWeight = ?, edition = ?, serialNumber = ?, 
          status = ?, equipmentType = ?,  locationAddress = ?, levelOfCondition = ?, imageName = ?
          where ownerId = ? and Id = ?`;
      const getMachinesR = await mysqlQuery(updateMachineQ, [
        info.equipmentName,
        info.equipmentWeight,
        info.edition,
        info.serialNumber,
        info.status,
        info.equipmentType,
        info.cityId,
        info.levelOfCondition,
        info.imageName,
        ownerId,
        info.Id
      ]);

      // -------------DELETE OLD IMAGE IF NEW IMAGE IS UPLOADED-------------------------------------------------------
      if (checkStatus[0].imageName !== info.imageName) {

        try {
          fs.unlinkSync(path.join(__dirname, '../../../', `/public/machineImages/${checkStatus[0].imageName}`));
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log(error);
        }
      }
      await mysqlQuery('COMMIT');

      return {
        code: HttpStatus.OK,
        message: 'success',
        data: getMachinesR
      };
    }
  } catch (e) {
    await mysqlQuery('ROLLBACK');
    throw Boom.badRequest(e);
  }
};

export const deleteMachine = async (info, ownerId) => {
  try {
    await mysqlQuery('START TRANSACTION');

    const chkStatus = await mysqlQuery(`select status from equipments where Id = ?`, [info.Id]);

    if (Number(chkStatus[0].status) === 2 || Number(chkStatus[0].status) === 3) {
      throw Boom.badRequest('Only free Equipments can be deleted');
    }
    const deleteMachineQ = `update equipments set deleted = 1 where ownerId = ? and Id = ?`;
    const deleteMachinesR = await mysqlQuery(deleteMachineQ, [ownerId, info.Id]);

    await mysqlQuery('COMMIT');

    return deleteMachinesR;
  } catch (e) {
    await mysqlQuery('ROLLBACK');
    throw Boom.badRequest(e);
  }
};

export const dashboardOverview = async (ownerId) => {
  try {
    const totalEquipmentsQ = await mysqlQuery(`SELECT count(*) as count FROM equipments where ownerId = ?`, [ownerId]);
    const freeEquipmentsQ = await mysqlQuery(
      `SELECT count(*) as count FROM equipments where ownerId = ? and status = 1`,
      [ownerId]
    );
    const occupiedEquipmentsQ = await mysqlQuery(
      `SELECT count(*) as count FROM equipments where ownerId = ? and status = 2`,
      [ownerId]
    );
    const underRepairEquipmentsQ = await mysqlQuery(
      `SELECT count(*) as count FROM equipments where ownerId = ? and status = 3`,
      [ownerId]
    );
    const finalObj = {};
    const countObj = {
      total: totalEquipmentsQ[0].count,
      free: freeEquipmentsQ[0].count,
      occupied: occupiedEquipmentsQ[0].count,
      underRepair: underRepairEquipmentsQ[0].count
    };

    finalObj.overview = countObj;

    const upcomingBookingsQ = await mysqlQuery(
      `SELECT BK.Id as bookingId, BK.equipmentType, BK.startDate, BK.endDate FROM booking BK
      left join equipments EQ on BK.machineId = EQ.Id and EQ.ownerId = ?
      where BK.startDate >= current_date()
      order by BK.Id desc`,
      [ownerId]
    );

    finalObj.upcomingBookings = upcomingBookingsQ;

    // ------------------FOR GRAPH----------------------------------------------------------------------------------
    const getMonth = await mysqlQuery(`select month(curdate()) as name, 
      dayofmonth(LAST_DAY(concat(year(curDate()), "-", month(curDate()), "-", "05"))) as totalDays,
      year(curdate()) as year`);
    const month = getMonth[0].name; // 12
    const days = getMonth[0].totalDays; // 31
    const year = getMonth[0].year; // 2020
    const startDate = year + '-' + month + '-' + '01';
    const endDate = year + '-' + month + '-' + days;

    const getAllDaysForMonth =
      await mysqlQuery(`SELECT '${startDate}' + INTERVAL t.n - 1 DAY as date, (select 0) as revenue
        FROM tally t
       WHERE t.n <= DATEDIFF(LAST_DAY('${endDate}'), '${startDate}') + 1`);

    const dataForMonth = await Promise.all(
      getAllDaysForMonth.map((d1) =>
        mysqlQuery(
          `SELECT createdAt, ifnull(sum(invoiceAmount), 0) as sum FROM booking
        where date(createdAt) = '${d1.date}' and 
        machineId in (select Id from equipments where ownerId = ?)`,
          [ownerId]
        )
      )
    );

    getAllDaysForMonth.map((el, idx) => ({
      ...el,
      revenue: dataForMonth[idx][0].sum
    }));

    finalObj.revenueGraph = getAllDaysForMonth;

    return finalObj;
  } catch (e) {
    throw Boom.badRequest(e);
  }
};

export const machineList = async (info, ownerId) => {
  try {
    const totalCountQ = await mysqlQuery(`SELECT * FROM equipments where ownerId = ? and deleted = 0`, [ownerId]);
    const totalPages = Math.ceil(totalCountQ.length / info.itemsPerPage);

    const limit = (info.page - 1) * info.itemsPerPage;
    const offset = info.itemsPerPage;
    const machineListQ = await mysqlQuery(
      `SELECT EQ.Id, EQ.equipmentName, TY.machineType as equipmentType, 
      ST.equipmentStatus as status, EQ.equipmentWeight, EQ.edition, EQ.serialNumber,
      EQ.createdAt, EQ.modifiedAt, EQ.ownerId, EQ.locationAddress as cityId, CT.name as locationAddress,
      EQ.levelOfCondition, EQ.imageName
      FROM equipments EQ 
      left join equipmenttype TY on EQ.equipmentType = TY.Id
      left join equipmentstatus ST on EQ.status = ST.Id
      left join cities CT on  EQ.locationAddress = CT.Id
      where EQ.ownerId = ? and EQ.deleted = 0
      order by Id desc
      limit ${limit}, ${offset}`,
      [ownerId]
    );

    return {
      totalPages: totalPages,
      machineList: machineListQ
    };
  } catch (e) {
    throw Boom.badRequest(e);
  }
};

export const getBookings = async (info, ownerId) => {
  try {
    const totalCountQ = await mysqlQuery(
      `SELECT BK.Id, BK.startDate, BK.endDate, EQ.serialNumber, BK.equipmentType, BK.transactionHash, BK.invoiceAmount 
      FROM booking BK 
      left join equipments EQ on BK.machineId = EQ.Id 
      where BK.machineId in (
       select Id from equipments where ownerId = ?
      )`,
      [ownerId]
    );
    const totalPages = Math.ceil(totalCountQ.length / info.itemsPerPage);

    const limit = (info.page - 1) * info.itemsPerPage;
    const offset = info.itemsPerPage;

    const getBookingsQ = `SELECT BK.Id, BK.startDate, BK.endDate, EQ.serialNumber, EQ.equipmentName, 
      EQ.imageName,
      EQ.levelOfCondition, EQ.equipmentWeight, EQ.edition, CT.name as location,  BK.equipmentType, BK.transactionHash, BK.invoiceAmount 
      FROM booking BK 
      left join equipments EQ on BK.machineId = EQ.Id 
      left join cities CT on CT.Id = EQ.locationAddress 
      where BK.machineId in (
       select Id from equipments where ownerId = ?
      )
      order by Id desc
      limit ${limit}, ${offset}`;
    const getBookingsR = await mysqlQuery(getBookingsQ, [ownerId]);

    return {
      totalPages: totalPages,
      bookingsList: getBookingsR
    };
  } catch (e) {
    throw Boom.badRequest(e);
  }
};

export const getInvoice = async (ownerId, info) => {
  try {
    const totalCountQ = await mysqlQuery(
      `select INV.Id, INV.bookingId, INV.invoiceAmount, INV.transactionHash, 
      EQ.serialNumber, TY.machineType
      from invoice INV
      left join equipments EQ on INV.machineId = EQ.Id
      left join equipmentType TY on TY.Id = EQ.equipmentType
      where INV.machineId in (
             select Id from equipments where ownerId = ?
            )
            order by bookingId asc`,
      [ownerId]
    );
    const totalPages = Math.ceil(totalCountQ.length / info.itemsPerPage);

    const limit = (info.page - 1) * info.itemsPerPage;
    const offset = info.itemsPerPage;

    const getBookingsQ = `select INV.Id, INV.bookingId, INV.invoiceAmount, INV.transactionHash, 
      EQ.serialNumber, TY.machineType as equipmentType 
      from invoice INV
      left join equipments EQ on INV.machineId = EQ.Id
      left join equipmentType TY on TY.Id = EQ.equipmentType
      where INV.machineId in (
             select Id from equipments where ownerId = ?
            )
            order by Id desc
      limit ${limit}, ${offset}`;
    const getBookingsR = await mysqlQuery(getBookingsQ, [ownerId]);

    return {
      totalPages: totalPages,
      invoiceList: getBookingsR
    };
  } catch (e) {
    throw Boom.badRequest(e);
  }
};
