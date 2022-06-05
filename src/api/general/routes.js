import { Router } from 'express';

import * as controller from './controller';
import * as auth from '../../validators/auth';

const router = Router();

/**
 * GET /api/cities.
 */
router.get('/cities', controller.getCities);

/**
 * POST /api/login.
 */
router.post('/login', controller.login);

/**
 * GET /api/profile.
 */
router.get('/profile', auth.validateToken, controller.getProfileInfo);

/**
 * POST /api/profile.
 */
router.post('/profile', auth.validateToken, controller.setProfileInfo);

/**
 * GET /api/transaction_details.
 */
router.get('/transaction_details', auth.validateToken, controller.getTransactionDetails);

/**
 * POST /api/lat_long_address.
 */
router.post('/lat_long_address', auth.validateToken, controller.getAddressFromLatLng);

export default router;
