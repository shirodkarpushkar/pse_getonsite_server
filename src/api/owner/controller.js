import Boom from '@hapi/boom';
import HttpStatus from 'http-status-codes';
import { uniqueId } from 'lodash';
import multer from 'multer';
import path from 'path';
import * as service from './service';

const config = process.env;

const maxSize = 3000000;
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(config.CWD, '/public/machineImages/'));
  },

  filename: (req, file, cb) => {
    const ext = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);

    // let ext = '.csv'
    if (!ext) {
      cb(null, uniqueId());
    } else {
      cb(null, uniqueId() + ext);
    }
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: maxSize }
}).any();

/**
 * Get all machine types.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
export const getMachineType = async (req, res, next) => {
  try {
    const data = await service.getMachineType();

    return res.status(HttpStatus.OK).json({ status: HttpStatus.OK, message: 'success', data });
  } catch (error) {
    next(error);
  }
};

/**
 * Get machine status.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
export const getMachineStatus = async (req, res, next) => {
  try {
    const data = await service.getMachineStatus();

    return res.status(HttpStatus.OK).json({ status: HttpStatus.OK, message: 'success', data });
  } catch (error) {
    next(error);
  }
};
/**
 * Add new machine.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
export const addNewMachine = async (req, res, next) => {
  try {
    const data = await service.addNewMachine(req.body, res.locals.tokenInfo.Id);

    return res.status(HttpStatus.OK).json({ status: HttpStatus.OK, message: 'success', data });
  } catch (error) {
    next(error);
  }
};
/**
 * Update machine.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
export const editMachine = async (req, res, next) => {
  try {
    const data = await service.editMachine(req.body, res.locals.tokenInfo.Id);

    return res.status(HttpStatus.OK).json({ status: HttpStatus.OK, message: 'success', data });
  } catch (error) {
    next(error);
  }
};

/**
 * MachineList.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
export const machineList = async (req, res, next) => {
  try {
    const ownerId = res.locals.tokenInfo.Id;
    const data = await service.machineList(req.query, ownerId);

    return res.status(HttpStatus.OK).json({ status: HttpStatus.OK, message: 'success', data });
  } catch (error) {
    next(error);
  }
};

/**
 * DeleteMachine.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
export const deleteMachine = async (req, res, next) => {
  try {
    const data = await service.deleteMachine(req.body, res.locals.tokenInfo.Id);

    return res.status(HttpStatus.OK).json({ status: HttpStatus.OK, message: 'success', data });
  } catch (error) {
    next(error);
  }
};

/**
 * DashboardOverview.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
export const dashboardOverview = async (req, res, next) => {
  try {
    const ownerId = res.locals.tokenInfo.Id;
    const data = await service.dashboardOverview(req.body, ownerId);

    return res.status(HttpStatus.OK).json({ status: HttpStatus.OK, message: 'success', data });
  } catch (error) {
    next(error);
  }
};
/**
 * Get Bookings.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
export const getBookings = async (req, res, next) => {
  try {
    const ownerId = res.locals.tokenInfo.Id;
    const data = await service.getBookings(req.query, ownerId);

    return res.status(HttpStatus.OK).json({ status: HttpStatus.OK, message: 'success', data });
  } catch (error) {
    next(error);
  }
};
/**
 * Get Invoice.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
export const getInvoice = async (req, res, next) => {
  try {
    const ownerId = res.locals.tokenInfo.Id;
    const data = await service.getInvoice(ownerId, req.query);

    return res.status(HttpStatus.OK).json({ status: HttpStatus.OK, message: 'success', data });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload Machine Image.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
export const uploadMachineImages = async (req, res, next) => {
  try {
    await upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        throw Boom.badRequest(err);
      } else if (err) {
        // An unknown error occurred when uploading.
        throw Boom.badRequest(err);
      }
      // Everything went fine.
      if (req.files) {
        const details = {
          status: HttpStatus.OK,
          message: 'success',
          data: {
            imageName: req.files[0].filename
          }
        };

        res.json(details);
      }
    });
  } catch (error) {
    next(error);
  }
};
