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
   * Sanitize prompt to avoid content policy violations
   */
  private static sanitizePrompt(prompt: string): string {
    // Remove potentially problematic words/phrases that might trigger content policy
    const problematicTerms = [
      'beautiful woman', 'beautiful girl', 'sexy', 'hot', 'attractive woman',
      'nude', 'naked', 'explicit', 'adult', 'mature', 'sensual',
      'violence', 'blood', 'gore', 'weapon', 'gun', 'knife',
      'hate', 'discrimination', 'stereotype', 'offensive'
    ];
    
    let sanitizedPrompt = prompt.toLowerCase();
    
    // Replace problematic terms with safer alternatives
    const replacements: { [key: string]: string } = {
      'beautiful woman': 'elegant person',
      'beautiful girl': 'young person',
      'sexy': 'stylish',
      'hot': 'warm',
      'attractive woman': 'elegant person',
      'nude': 'clothed',
      'naked': 'clothed',
      'explicit': 'artistic',
      'adult': 'mature',
      'mature': 'experienced',
      'sensual': 'artistic',
      'violence': 'action',
      'blood': 'red liquid',
      'gore': 'dramatic',
      'weapon': 'tool',
      'gun': 'device',
      'knife': 'blade',
      'hate': 'dislike',
      'discrimination': 'difference',
      'stereotype': 'characteristic',
      'offensive': 'bold'
    };
    
    // Apply replacements
    for (const [term, replacement] of Object.entries(replacements)) {
      sanitizedPrompt = sanitizedPrompt.replace(new RegExp(term, 'gi'), replacement);
    }
    
    // Remove any remaining problematic terms
    for (const term of problematicTerms) {
      sanitizedPrompt = sanitizedPrompt.replace(new RegExp(term, 'gi'), '');
    }
    
    // Clean up extra spaces and ensure proper formatting
    sanitizedPrompt = sanitizedPrompt.replace(/\s+/g, ' ').trim();
    
    // Ensure the prompt is not empty after sanitization
    if (!sanitizedPrompt || sanitizedPrompt.length < 10) {
      return 'A creative artistic scene with vibrant colors and interesting composition';
    }
    
    return sanitizedPrompt;
  }

  /**
   * Generate image using fal.ai gemini-25-flash-image model
   */
  static async generateImage(prompt: string): Promise<{ imageUrl: string; requestId: string }> {
    try {
      // Sanitize the prompt to avoid content policy violations
      const sanitizedPrompt = this.sanitizePrompt(prompt);
      console.log(`Original prompt: ${prompt}`);
      console.log(`Sanitized prompt: ${sanitizedPrompt}`);
      
      const result = await fal.subscribe('fal-ai/gemini-25-flash-image', {
        input: {
          prompt: sanitizedPrompt
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
      
      // Check if it's a content policy violation
      if (error && typeof error === 'object' && 'status' in error && error.status === 422) {
        const errorBody = (error as any).body;
        if (errorBody && errorBody.detail) {
          const isContentPolicyViolation = errorBody.detail.some((detail: any) => 
            detail.type === 'content_policy_violation' || 
            detail.msg?.toLowerCase().includes('content policy') ||
            detail.msg?.toLowerCase().includes('safety')
          );
          
          if (isContentPolicyViolation) {
            throw new Error('Content policy violation: The prompt contains content that violates Fal.ai safety guidelines. Please try a different prompt.');
          }
        }
      }
      
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
