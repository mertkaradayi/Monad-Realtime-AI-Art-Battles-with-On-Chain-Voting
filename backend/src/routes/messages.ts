import { Router } from 'express';
import { MessageController } from '../controllers/messages.js';
import { requireWallet } from '../middleware/middleware.js';

const router = Router();

/**
 * @route GET /api/messages
 * @desc Get all messages
 * @access Private (requires authentication)
 */
router.get('/', requireWallet, MessageController.getMessages);

/**
 * @route POST /api/messages
 * @desc Create a new message
 * @access Private (requires authentication + wallet)
 */
router.post('/', requireWallet, MessageController.createMessage);

/**
 * @route POST /api/messages/enhance
 * @desc Enhance a message using AI
 * @access Private (requires authentication)
 */
router.post('/enhance', MessageController.enhanceMessage);

/**
 * @route POST /api/messages/enhanced
 * @desc Create a message with automatic enhancement
 * @access Private (requires authentication + wallet)
 */
router.post('/enhanced', requireWallet, MessageController.createEnhancedMessage);

/**
 * @route GET /api/messages/enhancement-options
 * @desc Get available enhancement types and audiences
 * @access Public
 */
router.get('/enhancement-options', MessageController.getEnhancementOptions);

/**
 * @route PUT /api/messages/:id
 * @desc Update a message
 * @access Private (requires authentication + wallet)
 */
router.put('/:id', requireWallet, MessageController.updateMessage);

/**
 * @route DELETE /api/messages/:id
 * @desc Delete a message
 * @access Private (requires authentication + wallet)
 */
router.delete('/:id', requireWallet, MessageController.deleteMessage);

export default router;
