import { fal } from '@fal-ai/client';
import { config } from '../config/config.js';

// Configure fal.ai client with centralized configuration
fal.config({
  credentials: config.external.fal.apiKey,
});

export interface LLMRequest {
  model: string;
  prompt: string;
  temperature?: number;
  max_tokens?: number;
}

export interface LLMResponse {
  data: {
    output: string;
    reasoning?: string | null;
    partial: boolean;
    error?: string | null;
  };
  requestId: string;
}

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
}
