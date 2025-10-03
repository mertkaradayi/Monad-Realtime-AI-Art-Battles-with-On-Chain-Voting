import { FalService } from './fal.js';
import { LLMRequest } from '../types.js';

export class BattleConceptService {
  /**
   * Generate a unique battle concept/theme using LLM
   */
  static async generateBattleConcept(): Promise<string> {
    try {
      const conceptPrompt = `Generate a creative, unique art prompt starter for an AI art battle. 
The prompt should be:
- Creative and imaginative
- Incomplete (ending with "...")
- 10-15 words maximum
- Suitable for AI image generation
- Unique and interesting

Examples of good concepts:
- "A robot dancing in the rain..."
- "A cat wearing a space helmet..."
- "A tree growing upside down..."
- "A car made of cheese..."
- "An elephant balancing on a ball..."

Generate ONE unique concept that follows this format. Return only the concept, nothing else.`;

      const llmRequest: LLMRequest = {
        model: 'anthropic/claude-3.5-sonnet',
        prompt: conceptPrompt,
        temperature: 0.8, // Higher temperature for more creativity
        max_tokens: 50
      };

      const response = await FalService.generateText(llmRequest);
      
      // Clean up the response to ensure it ends with "..."
      let concept = response.data.output.trim();
      
      // Remove any quotes or extra formatting
      concept = concept.replace(/^["']|["']$/g, '');
      
      // Ensure it ends with "..."
      if (!concept.endsWith('...')) {
        concept += '...';
      }
      
      // Validate length
      if (concept.length > 100) {
        concept = concept.substring(0, 97) + '...';
      }
      
      return concept;
    } catch (error) {
      console.error('Battle concept generation error:', error);
      // Fallback to predefined concepts if LLM fails
      return this.getFallbackConcept();
    }
  }

  /**
   * Get a fallback concept if LLM generation fails
   */
  private static getFallbackConcept(): string {
    const fallbackConcepts = [
      "A robot dancing in the rain...",
      "A cat wearing a space helmet...",
      "A tree growing upside down...",
      "A car made of cheese...",
      "An elephant balancing on a ball...",
      "A dragon playing guitar...",
      "A house floating in clouds...",
      "A fish riding a bicycle...",
      "A clock melting in the sun...",
      "A bird wearing sunglasses..."
    ];
    
    const randomIndex = Math.floor(Math.random() * fallbackConcepts.length);
    return fallbackConcepts[randomIndex];
  }

  /**
   * Validate battle concept format
   */
  static validateConcept(concept: string): boolean {
    return concept.length > 5 && 
           concept.length <= 100 && 
           concept.endsWith('...') &&
           concept.trim().length > 0;
  }
}
