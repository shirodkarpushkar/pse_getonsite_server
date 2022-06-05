import HttpStatus from 'http-status-codes';

import * as userService from './service';

/**
 * Get all cities.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
export const getCities = async (req, res, next) => {
  try {
    const data = await userService.getCities();

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
    const data = await userService.login(req.body);

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
    const data = await userService.getProfileInfo();

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
    const data = await userService.setProfileInfo(userId, req.body);

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
    const data = await userService.getTransactionDetails(req.body);

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
    const data = await userService.getAddressFromLatLng(req.body);

    return res.status(HttpStatus.OK).json({ status: HttpStatus.OK, message: 'success', data });
  } catch (error) {
    next(error);
  }
}
