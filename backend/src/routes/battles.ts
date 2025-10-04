import { Router } from 'express';
import { BattleController } from '../controllers/battles.js';
import { authenticateWallet } from '../middleware/middleware.js';

const router = Router();

// Create a new battle
router.post('/', ...authenticateWallet, BattleController.createBattle);

// Get all battles
router.get('/', BattleController.getBattles);

// Get battles created by current user
router.get('/my-battles', ...authenticateWallet, BattleController.getBattlesByCreator);

// Get battle by ID
router.get('/:id', BattleController.getBattle);

// Join battle
router.post('/:id/join', ...authenticateWallet, BattleController.joinBattle);

// Submit prompt for battle
router.post('/:id/submit-prompt', ...authenticateWallet, BattleController.submitPrompt);

// Retry image generation for a specific participant
router.post('/:battleId/retry-image-generation', ...authenticateWallet, BattleController.retryImageGeneration);

export default router;
