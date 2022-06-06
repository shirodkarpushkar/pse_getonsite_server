import { Router } from 'express';
import * as controller from './controller';
import * as auth from '../../validators/auth';

const router = Router();

/**
 * GET /api/owner/dashboard.
 */
router.get('/dashboard', auth.validateToken, controller.dashboardOverview);

/**
 * GET /api/owner/machine_types.
 */
router.get('/machine_types', controller.getMachineType);

/**
 * GET /api/owner/machine_status.
 */
router.get('/machine_status', controller.getMachineStatus);

/**
 * GET /api/owner/machines.
 */
router.get('/machines', auth.validateToken, controller.machineList);

/**
 * POST /api/owner/machines.
 */
router.post('/machines', auth.validateToken, controller.addNewMachine);

/**
 * PATCH /api/owner/machines.
 */
router.patch('/machines', auth.validateToken, controller.editMachine);

/**
 * DELETE /api/owner/machines.
 */
router.delete('/machines', auth.validateToken, controller.deleteMachine);

/**
 * GET /api/owner/bookings.
 */
router.get('/bookings', auth.validateToken, controller.getBookings);

/**
 * GET /api/owner/invoices.
 */
router.get('/invoices', auth.validateToken, controller.getInvoice);

/**
 * GET /api/owner/machine_image.
 */
router.post('/machine_image', controller.uploadMachineImages);

export default router;
