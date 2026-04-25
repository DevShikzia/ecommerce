/**
 * Rutas de roles
 * Endpoints para gestión de roles (protegidos por middleware de permisos)
 */
import { Router } from 'express';
import { roleController } from '../controllers/role.controller';
import { checkPermission } from '../middleware/permisos.middleware';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);
router.use(checkPermission);

router.get('/', (req, res, next) => roleController.getRoles(req as AuthenticatedRequest, res, next));
router.get('/:id', (req, res, next) => roleController.getRoleById(req as AuthenticatedRequest, res, next));
router.post('/', (req, res, next) => roleController.createRole(req as AuthenticatedRequest, res, next));
router.put('/:id', (req, res, next) => roleController.updateRole(req as AuthenticatedRequest, res, next));
router.delete('/:id', (req, res, next) => roleController.deleteRole(req as AuthenticatedRequest, res, next));
router.post('/:id/permissions', (req, res, next) => roleController.addPermissions(req as AuthenticatedRequest, res, next));
router.delete('/:id/permissions', (req, res, next) => roleController.removePermissions(req as AuthenticatedRequest, res, next));

export default router;