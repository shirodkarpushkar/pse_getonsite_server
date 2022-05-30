import Boom from '@hapi/boom';
import { decryptData, tokenDecrypt, tokenEncrypt } from '../utils';

/**
 * Validate Token user request.
 *
 * @param   {Object}   req
 * @param   {Object}   res
 * @param   {Function} next
 * @returns {Promise}
 */
export const validateToken = async (req, res, next) => {
  try {
    if (req.headers.auth) {
      const tokenDecryptInfo = await tokenDecrypt(req.headers.auth);

      if (tokenDecryptInfo.data) {
        res.locals.tokenInfo = tokenDecryptInfo.data;
        const token = await tokenEncrypt(tokenDecryptInfo.data);

        res.header('auth', token);
        next();
      } else {
        throw Boom.unauthorized('Session expires. Please login again');
      }
    } else {
      throw Boom.forbidden('Token missing');
    }
  } catch (error) {
    return next(error);
  }
};

export const decryptRequest = async (req, res, next) => {
  try {
    if (req.body.encRequest) {
      const userinfo = await decryptData(req.body.encRequest);

      res.locals.requestedData = userinfo;
      next();
    } else {
      throw Boom.badRequest('Invalid request');
    }
  } catch (e) {
    return next(e);
  }
};
