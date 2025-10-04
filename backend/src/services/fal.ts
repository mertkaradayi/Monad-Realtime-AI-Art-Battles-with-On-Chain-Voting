import { fal } from '@fal-ai/client';
import { config } from '../config/config.js';
import { LLMRequest, LLMResponse } from '../types.js';

// Configure fal.ai client with centralized configuration
fal.config({
  credentials: config.external.fal.apiKey,
});

export class FalService {
  /**
   * Generate text using fal.ai any-llm endpoint
   */
  static async generateText(request: LLMRequest): Promise<LLMResponse> {
    try {
      const response = await fal.run('fal-ai/any-llm', {
        input: {
          model: request.model,
          prompt: request.prompt,
          temperature: request.temperature || 0.7,
          max_tokens: request.max_tokens || 1000,
        }
      });

      return response as LLMResponse;
    } catch (error) {
      console.error('Fal.ai API error:', error);
      throw new Error(`Failed to generate text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate text with streaming support
   */
  static async generateTextStream(request: LLMRequest) {
    try {
      const response = await fal.stream('fal-ai/any-llm', {
        input: {
          model: request.model,
          prompt: request.prompt,
          temperature: request.temperature || 0.7,
          max_tokens: request.max_tokens || 1000,
        }
      });

      return response;
    } catch (error) {
      console.error('Fal.ai streaming error:', error);
      throw new Error(`Failed to generate streaming text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get available models
   */
  static getAvailableModels(): string[] {
    return [
      'anthropic/claude-3.5-sonnet',
      'anthropic/claude-3-haiku',
      'google/gemini-pro-1.5',
      'google/gemini-2.5-pro',
      'meta-llama/llama-3.2-3b-instruct',
      'meta-llama/llama-3.2-1b-instruct',
      'openai/gpt-4o',
      'openai/gpt-4o-mini',
      'openai/gpt-3.5-turbo',
      'openai/gpt-5-nano',
    ];
  }

  /**
   * Validate model name
   */
  static isValidModel(model: string): boolean {
    return this.getAvailableModels().includes(model);
  }

  /**
   * Generate image using fal.ai gemini-25-flash-image model
   */
  static async generateImage(prompt: string): Promise<{ imageUrl: string; requestId: string }> {
    try {
      const result = await fal.subscribe('fal-ai/gemini-25-flash-image', {
        input: {
          prompt: prompt
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === 'IN_PROGRESS') {
            update.logs.map((log) => log.message).forEach(console.log);
          }
        },
      });

      // Extract image URL from result
      const imageUrl = result.data?.images?.[0]?.url;
      if (!imageUrl) {
        throw new Error('No image URL returned from fal.ai');
      }

      return {
        imageUrl,
        requestId: result.requestId
      };
    } catch (error) {
      console.error('Fal.ai image generation error:', error);
      throw new Error(`Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate images for both participants in a battle
   */
  static async generateBattleImages(participant1Prompt: string, participant2Prompt: string): Promise<{
    participant1ImageUrl: string;
    participant2ImageUrl: string;
    requestIds: string[];
  }> {
    try {
      // Generate images in parallel for better performance
      const [participant1Result, participant2Result] = await Promise.all([
        this.generateImage(participant1Prompt),
        this.generateImage(participant2Prompt)
      ]);

      return {
        participant1ImageUrl: participant1Result.imageUrl,
        participant2ImageUrl: participant2Result.imageUrl,
        requestIds: [participant1Result.requestId, participant2Result.requestId]
      };
    } catch (error) {
      console.error('Fal.ai battle image generation error:', error);
      throw new Error(`Failed to generate battle images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
