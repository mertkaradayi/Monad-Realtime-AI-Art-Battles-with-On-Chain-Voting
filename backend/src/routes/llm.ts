import { Router } from 'express';
import { LLMController } from '../controllers/llm.js';

const router = Router();

/**
 * @route POST /api/llm/generate
 * @desc Generate text using fal.ai any-llm endpoint
 * @access Private (requires authentication)
 */
router.post('/generate', LLMController.generateText);

/**
 * @route POST /api/llm/stream
 * @desc Generate text with streaming support
 * @access Private (requires authentication)
 */
router.post('/stream', LLMController.generateTextStream);

/**
 * @route GET /api/llm/models
 * @desc Get available models
 * @access Public
 */
router.get('/models', LLMController.getModels);

export default router;
