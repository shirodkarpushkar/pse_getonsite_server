import HttpStatus from 'http-status-codes';

import * as service from './service';

/**
 * Check availbality.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
export const checkAvailability = async (req, res, next) => {
  try {
    const data = await service.checkAvailability(req.body);

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
    const data = await service.getBookings(req.query);

    return res.status(HttpStatus.OK).json({ status: HttpStatus.OK, message: 'success', data });
  } catch (error) {
    next(error);
  }
};
/**
 * Get Invoices.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
export const getInvoice = async (req, res, next) => {
  try {
    const consumerId = res.locals.tokenInfo.Id;
    const data = await service.getInvoice(req.query, consumerId);

    return res.status(HttpStatus.OK).json({ status: HttpStatus.OK, message: 'success', data });
  } catch (error) {
    next(error);
  }
};

/**
 * Create Booking.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
export const createBooking = async (req, res, next) => {
  try {
    const consumerId = res.locals.tokenInfo.Id;
    const data = await service.createBooking(req.body, consumerId);

    return res.status(HttpStatus.OK).json({ status: HttpStatus.OK, message: 'success', data });
  } catch (error) {
    next(error);
  }
};

/**
 * Dashboard.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
export const dashboard = async (req, res, next) => {
  try {
    const consumerId = res.locals.tokenInfo.Id;
    const data = await service.dashboardAPI(consumerId);

    return res.status(HttpStatus.OK).json({ status: HttpStatus.OK, message: 'success', data });
  } catch (error) {
    next(error);
  }
};
