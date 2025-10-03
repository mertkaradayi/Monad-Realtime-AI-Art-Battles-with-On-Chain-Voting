import { Request, Response } from 'express';
import { supabase } from '../config/config.js';
import { MessageEnhancementService } from '../services/enhancement.js';
import { EnhancementRequest } from '../types.js';

export class MessageController {
  /**
   * Get all messages
   */
  static async getMessages(req: Request, res: Response): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      res.json({ 
        success: true,
        data: data || []
      });
    } catch (err) {
      const error = err as Error;
      console.error('Error fetching messages:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch messages',
        message: error.message 
      });
    }
  }

  /**
   * Create a new message
   */
  static async createMessage(req: Request, res: Response): Promise<void> {
    try {
      const { content, author } = req.body;
      
      if (!content) {
        res.status(400).json({
          success: false,
          error: 'Content is required'
        });
        return;
      }
      
      const { data, error } = await supabase
        .from('messages')
        .insert([
          { 
            content: content.trim(),
            author: req.user?.wallet?.address || 'Anonymous'
          }
        ])
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      res.status(201).json({ 
        success: true,
        data 
      });
    } catch (err) {
      const error = err as Error;
      console.error('Error creating message:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to create message',
        message: error.message 
      });
    }
  }

  /**
   * Enhance a message using AI
   */
  static async enhanceMessage(req: Request, res: Response): Promise<void> {
    try {
      const { originalMessage, enhancementType, targetAudience } = req.body;

      // Validate required fields
      if (!originalMessage) {
        res.status(400).json({
          success: false,
          error: 'originalMessage is required'
        });
        return;
      }

      // Validate enhancement type
      const validEnhancementTypes = MessageEnhancementService.getEnhancementTypes();
      if (enhancementType && !validEnhancementTypes.includes(enhancementType)) {
        res.status(400).json({
          success: false,
          error: `Invalid enhancement type. Available types: ${validEnhancementTypes.join(', ')}`
        });
        return;
      }

      // Validate target audience
      const validAudiences = MessageEnhancementService.getTargetAudiences();
      if (targetAudience && !validAudiences.includes(targetAudience)) {
        res.status(400).json({
          success: false,
          error: `Invalid target audience. Available audiences: ${validAudiences.join(', ')}`
        });
        return;
      }

      const enhancementRequest: EnhancementRequest = {
        originalMessage: originalMessage.trim(),
        enhancementType: enhancementType || 'clarity',
        targetAudience: targetAudience || 'general'
      };

      const enhancedMessage = await MessageEnhancementService.enhanceMessage(enhancementRequest);
      
      res.json({
        success: true,
        data: enhancedMessage
      });
    } catch (error) {
      console.error('Message enhancement error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to enhance message',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create a message with automatic enhancement
   */
  static async createEnhancedMessage(req: Request, res: Response): Promise<void> {
    try {
      const { content, author, enhancementType, targetAudience, autoEnhance } = req.body;
      
      if (!content) {
        res.status(400).json({
          success: false,
          error: 'Content is required'
        });
        return;
      }

      let finalContent = content.trim();
      let enhancementData = null;

      // Enhance the message if requested
      if (autoEnhance) {
        try {
          const enhancementRequest: EnhancementRequest = {
            originalMessage: finalContent,
            enhancementType: enhancementType || 'clarity',
            targetAudience: targetAudience || 'general'
          };

          const enhancedMessage = await MessageEnhancementService.enhanceMessage(enhancementRequest);
          finalContent = enhancedMessage.enhancedMessage;
          enhancementData = enhancedMessage;
        } catch (enhancementError) {
          console.warn('Enhancement failed, using original message:', enhancementError);
          // Continue with original message if enhancement fails
        }
      }
      
      const { data, error } = await supabase
        .from('messages')
        .insert([
          { 
            content: finalContent,
            author: req.user?.wallet?.address || 'Anonymous',
            original_content: autoEnhance ? content.trim() : null,
            enhancement_data: enhancementData ? JSON.stringify(enhancementData) : null
          }
        ])
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      res.status(201).json({ 
        success: true,
        data: {
          ...data,
          enhancement: enhancementData
        }
      });
    } catch (err) {
      const error = err as Error;
      console.error('Error creating enhanced message:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to create message',
        message: error.message 
      });
    }
  }

  /**
   * Update a message
   */
  static async updateMessage(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { content, author } = req.body;
      
      if (!content) {
        res.status(400).json({
          success: false,
          error: 'Content is required'
        });
        return;
      }
      
      const { data, error } = await supabase
        .from('messages')
        .update({ 
          content: content.trim(),
          author: req.user?.wallet?.address || 'Anonymous'
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      if (!data) {
        res.status(404).json({
          success: false,
          error: 'Message not found'
        });
        return;
      }
      
      res.json({ 
        success: true,
        data 
      });
    } catch (err) {
      const error = err as Error;
      console.error('Error updating message:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to update message',
        message: error.message 
      });
    }
  }

  /**
   * Delete a message
   */
  static async deleteMessage(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const { data, error } = await supabase
        .from('messages')
        .delete()
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      if (!data) {
        res.status(404).json({
          success: false,
          error: 'Message not found'
        });
        return;
      }
      
      res.json({ 
        success: true,
        message: 'Message deleted successfully'
      });
    } catch (err) {
      const error = err as Error;
      console.error('Error deleting message:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to delete message',
        message: error.message 
      });
    }
  }

  /**
   * Get available enhancement types and audiences
   */
  static async getEnhancementOptions(req: Request, res: Response): Promise<void> {
    try {
      const enhancementTypes = MessageEnhancementService.getEnhancementTypes();
      const targetAudiences = MessageEnhancementService.getTargetAudiences();
      
      res.json({
        success: true,
        data: {
          enhancementTypes,
          targetAudiences,
          descriptions: {
            enhancementTypes: {
              grammar: 'Fix grammatical errors and improve sentence structure',
              clarity: 'Make the message clearer and easier to understand',
              professional: 'Make the message more professional and business-appropriate',
              creative: 'Make the message more engaging and creative',
              concise: 'Make the message more concise and to the point'
            },
            targetAudiences: {
              general: 'Clear, accessible language for anyone',
              professional: 'Professional terminology for business communication',
              academic: 'Precise, scholarly language with academic tone',
              casual: 'Friendly, conversational language'
            }
          }
        }
      });
    } catch (error) {
      console.error('Error getting enhancement options:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get enhancement options',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
