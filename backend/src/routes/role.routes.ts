/**
 * Rutas de roles
 * Endpoints para gestión de roles (protegidos por middleware de permisos)
 */
import { Router, Request, Response } from 'express';
import { roleController } from '../controllers/role.controller';
import { checkPermission } from '../middleware/permisos.middleware';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);
router.use(checkPermission);

router.get('/', (req: Request, res: Response) => roleController.getRoles(req as AuthenticatedRequest, res));
router.get('/:id', (req: Request, res: Response) => roleController.getRoleById(req as AuthenticatedRequest, res));
router.post('/', (req: Request, res: Response) => roleController.createRole(req as AuthenticatedRequest, res));
router.put('/:id', (req: Request, res: Response) => roleController.updateRole(req as AuthenticatedRequest, res));
router.delete('/:id', (req: Request, res: Response) => roleController.deleteRole(req as AuthenticatedRequest, res));
router.post('/:id/permissions', (req: Request, res: Response) => roleController.addPermissions(req as AuthenticatedRequest, res));
router.delete('/:id/permissions', (req: Request, res: Response) => roleController.removePermissions(req as AuthenticatedRequest, res));

export default router;