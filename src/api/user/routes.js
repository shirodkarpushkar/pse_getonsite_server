import { Router } from 'express';

import * as userController from './controller';
import { userValidator } from '../../validators/userValidator';

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
router.get('/profile', userValidator, userController.getProfileInfo);

/**
 * POST /api/profile.
 */
router.get('/profile', userValidator, userController.setProfileInfo);

export default router;
