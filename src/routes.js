import { Router } from 'express';

import swaggerSpec from './utils/swagger';
import generalRoutes from './api/general/routes';
import consumerRoutes from './api/consumer/routes';
import ownerRoutes from './api/owner/routes';

/**
 * Contains all API routes for the application.
 */
const router = Router();

/**
 * GET /api/swagger.json.
 */
router.get('/swagger.json', (req, res) => {
  res.json(swaggerSpec);
});

/**
 * GET /api.
 */
router.get('/', (req, res) => {
  res.json({
    app: req.app.locals.title,
    apiVersion: req.app.locals.version
  });
});

router.use('/', generalRoutes);
router.use('/consumer', consumerRoutes);
router.use('/owner', ownerRoutes);

export default router;
