import { Request, Response } from 'express';
import { FalService, LLMRequest } from '../services/falService.js';

export class LLMController {
  /**
   * Generate text using fal.ai any-llm endpoint
   */
  static async generateText(req: Request, res: Response): Promise<void> {
    try {
      const { model, prompt, temperature, max_tokens } = req.body;

      // Validate required fields
      if (!model || !prompt) {
        res.status(400).json({
          error: 'Missing required fields: model and prompt are required'
        });
        return;
      }

      // Validate model
      if (!FalService.isValidModel(model)) {
        res.status(400).json({
          error: 'Invalid model. Available models: ' + FalService.getAvailableModels().join(', ')
        });
        return;
      }

      // Validate prompt format
      if (typeof prompt !== 'string' || prompt.trim().length === 0) {
        res.status(400).json({
          error: 'Prompt must be a non-empty string'
        });
        return;
      }

      const request: LLMRequest = {
        model,
        prompt: prompt.trim(),
        temperature: temperature || 0.7,
        max_tokens: max_tokens || 1000,
      };

      const response = await FalService.generateText(request);
      
      res.json({
        success: true,
        data: response
      });
    } catch (error) {
      console.error('LLM generation error:', error);
      res.status(500).json({
        error: 'Failed to generate text',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get available models
   */
  static async getModels(req: Request, res: Response): Promise<void> {
    try {
      const models = FalService.getAvailableModels();
      
      res.json({
        success: true,
        data: {
          models,
          count: models.length
        }
      });
    } catch (error) {
      console.error('Get models error:', error);
      res.status(500).json({
        error: 'Failed to get available models',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Generate text with streaming support
   */
  static async generateTextStream(req: Request, res: Response): Promise<void> {
    try {
      const { model, prompt, temperature, max_tokens } = req.body;

      // Validate required fields
      if (!model || !prompt) {
        res.status(400).json({
          error: 'Missing required fields: model and prompt are required'
        });
        return;
      }

      // Validate model
      if (!FalService.isValidModel(model)) {
        res.status(400).json({
          error: 'Invalid model. Available models: ' + FalService.getAvailableModels().join(', ')
        });
        return;
      }

      // Validate prompt format
      if (typeof prompt !== 'string' || prompt.trim().length === 0) {
        res.status(400).json({
          error: 'Prompt must be a non-empty string'
        });
        return;
      }

      const request: LLMRequest = {
        model,
        prompt: prompt.trim(),
        temperature: temperature || 0.7,
        max_tokens: max_tokens || 1000,
      };

      // Set up Server-Sent Events
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      });

      const stream = await FalService.generateTextStream(request);
      
      // Handle streaming response using FalStream
      stream.on('data', (chunk: any) => {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      });

      stream.on('done', () => {
        res.write('data: [DONE]\n\n');
        res.end();
      });

      stream.on('error', (error: any) => {
        console.error('Streaming error:', error);
        res.write(`data: ${JSON.stringify({ error: 'Streaming error' })}\n\n`);
        res.end();
      });
    } catch (error) {
      console.error('LLM streaming error:', error);
      res.status(500).json({
        error: 'Failed to generate streaming text',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
