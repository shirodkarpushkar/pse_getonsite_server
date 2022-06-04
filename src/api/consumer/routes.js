import { Router } from "express";
import * as controller from './controller'
const router = Router();

/**
 * GET /api/cities.
 */
router.get('/cities', controller.getCities);

export default router;
