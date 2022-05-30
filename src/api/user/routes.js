import { Router } from 'express';

import * as userController from './controller';
import * as auth from '../../validators/auth';

const router = Router();

/**
 * GET /api/cities.
 */
router.get('/cities', userController.getCities);

/**
 * GET /api/users/login.
 */
router.get('/login', userController.login);

/**
 * GET /api/profile.
 */
router.get('/profile', auth.validateToken, userController.getProfileInfo);

/**
 * POST /api/profile.
 */
router.get('/profile', auth.validateToken, userController.setProfileInfo);

/**
 * GET /api/transaction_details.
 */
router.get('/transaction_details', auth.validateToken, userController.getTransactionDetails);

/**
 * GET /api/lat_long_address.
 */
router.get('/lat_long_address', auth.validateToken, userController.getAddressFromLatLng);

export default router;
