import { Router } from 'express';
import { BattleController } from '../controllers/battles.js';
import { authenticateWallet } from '../middleware/middleware.js';

const router = Router();

// Create a new battle
router.post('/', ...authenticateWallet, BattleController.createBattle);

// Get all battles
router.get('/', BattleController.getBattles);

// Get battle by ID
router.get('/:id', BattleController.getBattle);

// Join battle
router.post('/:id/join', ...authenticateWallet, BattleController.joinBattle);

// Submit prompt for battle
router.post('/:id/submit-prompt', ...authenticateWallet, BattleController.submitPrompt);

export default router;
