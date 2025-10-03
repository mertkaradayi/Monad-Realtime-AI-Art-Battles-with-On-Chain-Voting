import { FalService } from './fal.js';
import { EnhancementRequest, EnhancementResponse, LLMRequest } from '../types.js';

export class MessageEnhancementService {
  /**
   * Enhance a user message using AI
   */
  static async enhanceMessage(request: EnhancementRequest): Promise<EnhancementResponse> {
    try {
      const enhancementType = request.enhancementType || 'clarity';
      const targetAudience = request.targetAudience || 'general';
      
      // Create enhancement prompt based on type
      const enhancementPrompt = this.createEnhancementPrompt(
        request.originalMessage,
        enhancementType,
        targetAudience
      );

      const llmRequest: LLMRequest = {
        model: 'anthropic/claude-3.5-sonnet', // Use Claude for best enhancement quality
        prompt: enhancementPrompt,
        temperature: 0.3, // Lower temperature for more consistent results
        max_tokens: 1000
      };

      const response = await FalService.generateText(llmRequest);
      
      // Parse the enhanced message from the response
      const enhancedMessage = this.parseEnhancedMessage(response.data.output);
      const improvements = this.extractImprovements(response.data.output);
      
      return {
        originalMessage: request.originalMessage,
        enhancedMessage,
        enhancementType,
        improvements,
        confidence: this.calculateConfidence(request.originalMessage, enhancedMessage)
      };
    } catch (error) {
      console.error('Message enhancement error:', error);
      throw new Error(`Failed to enhance message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create enhancement prompt based on type and audience
   */
  private static createEnhancementPrompt(
    message: string,
    type: string,
    audience: string
  ): string {
    const basePrompt = `Please enhance the following message to make it better. Return ONLY the enhanced message, followed by a brief explanation of the improvements made.

Original message: "${message}"

Enhancement type: ${type}
Target audience: ${audience}

Requirements:`;

    const typeSpecificRequirements = {
      grammar: 'Fix all grammatical errors, improve sentence structure, and ensure proper punctuation.',
      clarity: 'Make the message clearer and easier to understand. Remove ambiguity and improve flow.',
      professional: 'Make the message more professional and business-appropriate. Use formal language and structure.',
      creative: 'Make the message more engaging and creative while maintaining the original intent.',
      concise: 'Make the message more concise and to the point while preserving all important information.'
    };

    const audienceSpecificRequirements = {
      general: 'Use clear, accessible language that anyone can understand.',
      professional: 'Use professional terminology and formal structure appropriate for business communication.',
      academic: 'Use precise, scholarly language with proper academic tone.',
      casual: 'Use friendly, conversational language while maintaining clarity.'
    };

    return `${basePrompt}
- ${typeSpecificRequirements[type as keyof typeof typeSpecificRequirements]}
- ${audienceSpecificRequirements[audience as keyof typeof audienceSpecificRequirements]}
- Maintain the original intent and meaning
- Keep the same length or make it slightly shorter
- Do not add information that wasn't in the original message

Enhanced message:`;
  }

  /**
   * Parse the enhanced message from the AI response
   */
  private static parseEnhancedMessage(response: string): string {
    // Extract the enhanced message (usually the first part before any explanation)
    const lines = response.split('\n');
    let enhancedMessage = '';
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.toLowerCase().includes('improvement') && 
          !trimmedLine.toLowerCase().includes('change') && 
          !trimmedLine.toLowerCase().includes('enhanced')) {
        enhancedMessage = trimmedLine;
        break;
      }
    }
    
    // If no clear enhanced message found, use the first non-empty line
    if (!enhancedMessage) {
      enhancedMessage = lines.find(line => line.trim())?.trim() || response;
    }
    
    return enhancedMessage;
  }

  /**
   * Extract improvements made to the message
   */
  private static extractImprovements(response: string): string[] {
    const improvements: string[] = [];
    const lines = response.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim().toLowerCase();
      if (trimmedLine.includes('improvement') || trimmedLine.includes('change') || 
          trimmedLine.includes('enhanced') || trimmedLine.includes('fixed')) {
        improvements.push(line.trim());
      }
    }
    
    // If no specific improvements found, add generic ones
    if (improvements.length === 0) {
      improvements.push('Improved clarity and readability');
      improvements.push('Enhanced sentence structure');
    }
    
    return improvements;
  }

  /**
   * Calculate confidence score for the enhancement
   */
  private static calculateConfidence(original: string, enhanced: string): number {
    // Simple confidence calculation based on length difference and content similarity
    const lengthDiff = Math.abs(original.length - enhanced.length) / original.length;
    const similarity = this.calculateSimilarity(original, enhanced);
    
    // Higher confidence if similarity is good and length change is reasonable
    const confidence = Math.max(0, Math.min(1, similarity - lengthDiff * 0.5));
    return Math.round(confidence * 100);
  }

  /**
   * Calculate similarity between two strings
   */
  private static calculateSimilarity(str1: string, str2: string): number {
    const words1 = str1.toLowerCase().split(/\s+/);
    const words2 = str2.toLowerCase().split(/\s+/);
    
    const commonWords = words1.filter(word => words2.includes(word));
    const totalWords = new Set([...words1, ...words2]).size;
    
    return commonWords.length / totalWords;
  }

  /**
   * Get available enhancement types
   */
  static getEnhancementTypes(): string[] {
    return ['grammar', 'clarity', 'professional', 'creative', 'concise'];
  }

  /**
   * Get available target audiences
   */
  static getTargetAudiences(): string[] {
    return ['general', 'professional', 'academic', 'casual'];
  }
}
