import { Router } from "express";
import * as controller from './controller'
import * as auth from '../../validators/auth'
const router = Router();

/**
 * POST /api/consumer/availability.
 */
router.post('/availability', controller.checkAvailability);

/**
 * GET /api/consumer/bookings.
 */

router.get('/bookings', auth.validateToken, controller.getBookings);

/**
 * POST /api/consumer/bookings.
 */
router.post('/bookings', auth.validateToken, controller.createBooking);

/**
 * GET /api/consumer/dashboard.
 */
router.get('/dashboard', auth.validateToken, controller.dashboard);

/**
 * GET /api/consumer/invoices.
 */
router.get('/invoices', auth.validateToken, controller.getInvoice);

export default router;
