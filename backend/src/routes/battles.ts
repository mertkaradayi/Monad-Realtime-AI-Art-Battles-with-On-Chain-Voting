import { Router } from 'express';
import { BattleController } from '../controllers/battles.js';
import { authenticateWallet, auth } from '../middleware/middleware.js';

const router = Router();

// Create a new battle (requires authentication + wallet)
router.post('/', ...authenticateWallet, BattleController.createBattle);

// Get all battles (public)
router.get('/', BattleController.getBattles);

// Get battles created by current user (requires authentication + wallet)
router.get('/my-battles', ...authenticateWallet, BattleController.getBattlesByCreator);

// Get battle by ID (public - no authentication required)
router.get('/:id', BattleController.getBattle);

// Get contract information and voting instructions for a battle (public)
router.get('/:id/contract-info', BattleController.getContractInfo);

// Join battle
router.post('/:id/join', ...authenticateWallet, BattleController.joinBattle);

// Submit prompt for battle
router.post('/:id/submit-prompt', ...authenticateWallet, BattleController.submitPrompt);

// Retry image generation for a specific participant
router.post('/:battleId/retry-image-generation', ...authenticateWallet, BattleController.retryImageGeneration);

export default router;
