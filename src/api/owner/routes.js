import { Router } from 'express';
import * as controller from './controller';
import * as auth from '../../validators/auth';

const router = Router();

/**
 * GET /api/machine_types.
 */
router.get('/machine_types',  controller.getMachineType);

/**
 * GET /api/machine_status.
 */
router.get('/machine_status', controller.getMachineStatus);

/**
 * GET /api/machines.
 */
router.get('/machines',auth.validateToken ,controller.machineList);

/**
 * POST /api/machines.
 */
router.post('/machines', controller.addNewMachine);

/**
 * PATCH /api/machines.
 */
router.patch('/machines', controller.editMachine);

/**
 * DELETE /api/machines.
 */
router.delete('/machines', controller.deleteMachine);

/**
 * GET /api/bookings.
 */
router.post('/bookings', auth.validateToken, controller.getBookings);

/**
 * GET /api/invoices.
 */
router.post('/invoices', auth.validateToken, controller.getInvoice);

/**
 * GET /api/machine_image.
 */
router.post('/machine_image', controller.uploadMachineImages);

export default router;
