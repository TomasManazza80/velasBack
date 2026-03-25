import express from 'express';
const router = express.Router();
import controller from '../controller/encargosController.js';

router.get('/', controller.getAll);
router.post('/', controller.create);
router.patch('/:id', controller.update);
router.patch('/:id/status', controller.updateStatus);
router.post('/:id/notify', controller.notifyClient);
router.delete('/:id', controller.delete);

export default router;