import HttpStatus from 'http-status-codes';

import * as service from './service';

/**
 * Get all cities.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
export const getCities = async (req, res, next) => {
  try {
    const data = await service.getCities();

    return res.status(HttpStatus.OK).json({ status: HttpStatus.OK, message: 'success', data });
  } catch (error) {
    next(error);
  }
};
/**
 * Login.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
export const login = async (req, res, next) => {
  try {
    const data = await service.login(req.body);

    return res.status(HttpStatus.OK).json({ status: HttpStatus.OK, message: 'success', data });
  } catch (error) {
    next(error);
  }
};
/**
 * Get Profile Info.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
export const getProfileInfo = async (req, res, next) => {
  try {
    const userId = res.locals.tokenInfo.Id;
    const data = await service.getProfileInfo(userId);

    return res.status(HttpStatus.OK).json({ status: HttpStatus.OK, message: 'success', data });
  } catch (error) {
    next(error);
  }
};
/**
 * SET Profile Info.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
export const setProfileInfo = async (req, res, next) => {
  try {
    const userId = res.locals.tokenInfo.Id;
    const data = await service.setProfileInfo(userId, req.body);

    return res.status(HttpStatus.OK).json({ status: HttpStatus.OK, message: 'success', data });
  } catch (error) {
    next(error);
  }
};

/**
 * GetTransactionDetails.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
export const getTransactionDetails = async (req, res, next) => {
  try {
    const data = await service.getTransactionDetails(req.body);

    return res.status(HttpStatus.OK).json({ status: HttpStatus.OK, message: 'success', data });
  } catch (error) {
    next(error);
  }
};
/**
 * GetAddressFromLatLng.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
export const getAddressFromLatLng = async (req, res, next) => {
  try {
    const data = await service.getAddressFromLatLng(req.body);

    return res.status(HttpStatus.OK).json({ status: HttpStatus.OK, message: 'success', data });
  } catch (error) {
    next(error);
  }
}
