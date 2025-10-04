import { Request, Response } from 'express';
import { supabaseAdmin, config } from '../config/config.js';
import { BattleConceptService } from '../services/battle-concept.js';
import { QRGeneratorService } from '../services/qr-generator.js';
import { FalService } from '../services/fal.js';
import { ContractDeploymentService } from '../services/contract-deployment.js';
import { Battle, BattleInsert } from '../database/types/database.js';

export class BattleController {
  /**
   * Create a new battle with concept and QR code
   */
  static async createBattle(req: Request, res: Response): Promise<void> {
    try {
      const walletAddress = req.user?.wallet?.address;

      if (!walletAddress) {
        res.status(403).json({
          success: false,
          error: 'Wallet required',
        });
        return;
      }

      // Generate battle concept using LLM
      const concept = await BattleConceptService.generateBattleConcept();
      
      // Create battle in database
      const battleInsert: BattleInsert = {
        concept: concept,
        status: 'waiting',
        creator_wallet: walletAddress
      };

      const { data: battle, error } = await supabaseAdmin
        .from('battles')
        .insert([battleInsert])
        .select()
        .single();
      
      if (error) {
        throw error;
      }

      // Generate joining QR code
      const joiningQR = await QRGeneratorService.generateJoiningQR(battle.id);
      
      // Update battle with QR code data
      const { data: updatedBattle, error: updateError } = await supabaseAdmin
        .from('battles')
        .update({ joining_qr_data: joiningQR })
        .eq('id', battle.id)
        .select()
        .single();
      
      // Only throw if we still don't have an updated battle
      if (updateError && !updatedBattle) {
        throw updateError;
      }
      
      res.status(201).json({ 
        success: true,
        data: {
          ...updatedBattle,
          joiningQR: joiningQR
        }
      });
    } catch (err) {
      const error = err as Error;
      console.error('Error creating battle:', error);
      const includeDetails = config.server.nodeEnv !== 'production';
      res.status(500).json({ 
        success: false,
        error: 'Failed to create battle',
        ...(includeDetails ? { message: error.message } : {})
      });
    }
  }

  /**
   * Get contract information and voting instructions for a battle
   */
  static async getContractInfo(req: Request, res: Response): Promise<void> {
    try {
      const { id: battleId } = req.params;

      if (!battleId) {
        res.status(400).json({
          success: false,
          error: 'Battle ID is required',
        });
        return;
      }

      // Get battle details
      const { data: battle, error } = await supabaseAdmin
        .from('battles')
        .select('*')
        .eq('id', battleId)
        .single();

      if (error || !battle) {
        res.status(404).json({
          success: false,
          error: 'Battle not found',
        });
        return;
      }

      // Check if contract is deployed
      if (!ContractDeploymentService.isDeployed()) {
        res.status(503).json({
          success: false,
          error: 'Contract not deployed yet',
        });
        return;
      }

      // Get contract information
      const contractAddress = ContractDeploymentService.getContractAddress();
      const deploymentInfo = ContractDeploymentService.getDeploymentInfo();
      const votingQRData = battle.voting_qr_data;
      const instructions = ContractDeploymentService.getContractInteractionInstructions(battle);

      res.json({
        success: true,
        data: {
          contractAddress,
          deploymentInfo,
          votingQRData: votingQRData ? JSON.parse(votingQRData) : null,
          instructions,
          battle: {
            id: battle.id,
            concept: battle.concept,
            participant1: battle.participant1_wallet,
            participant2: battle.participant2_wallet,
            participant1ImageUrl: battle.participant1_image_url,
            participant2ImageUrl: battle.participant2_image_url,
            status: battle.status,
            totalVotes: battle.total_votes,
            winner: battle.winner_wallet,
          }
        }
      });
    } catch (error) {
      console.error('Failed to get contract info:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get contract information',
      });
    }
  }

  /**
   * Get battle by ID
   */
  static async getBattle(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const { data: battle, error } = await supabaseAdmin
        .from('battles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          res.status(404).json({
            success: false,
            error: 'Battle not found'
          });
          return;
        }
        throw error;
      }
      
      res.json({ 
        success: true,
        data: battle
      });
    } catch (err) {
      const error = err as Error;
      console.error('Error fetching battle:', error);
      const includeDetails = config.server.nodeEnv !== 'production';
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch battle',
        ...(includeDetails ? { message: error.message } : {})
      });
    }
  }

  /**
   * Get all battles
   */
  static async getBattles(req: Request, res: Response): Promise<void> {
    try {
      const { data: battles, error } = await supabaseAdmin
        .from('battles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      res.json({ 
        success: true,
        data: battles || []
      });
    } catch (err) {
      const error = err as Error;
      console.error('Error fetching battles:', error);
      const includeDetails = config.server.nodeEnv !== 'production';
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch battles',
        ...(includeDetails ? { message: error.message } : {})
      });
    }
  }

  /**
   * Get battles created by a specific wallet address
   */
  static async getBattlesByCreator(req: Request, res: Response): Promise<void> {
    try {
      const walletAddress = req.user?.wallet?.address;

      if (!walletAddress) {
        res.status(403).json({
          success: false,
          error: 'Wallet required',
        });
        return;
      }

      const { data: battles, error } = await supabaseAdmin
        .from('battles')
        .select('*')
        .eq('creator_wallet', walletAddress)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      res.json({ 
        success: true,
        data: battles || []
      });
    } catch (err) {
      const error = err as Error;
      console.error('Error fetching battles by creator:', error);
      const includeDetails = config.server.nodeEnv !== 'production';
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch battles',
        ...(includeDetails ? { message: error.message } : {})
      });
    }
  }

  /**
   * Join battle (for participants)
   */
  static async joinBattle(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const walletAddress = req.user?.wallet?.address;

      if (!walletAddress) {
        res.status(403).json({
          success: false,
          error: 'Wallet required',
        });
        return;
      }

      // First, get the battle to check if user is the creator
      const { data: battle, error: fetchError } = await supabaseAdmin
        .from('battles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError || !battle) {
        res.status(404).json({
          success: false,
          error: 'Battle not found'
        });
        return;
      }

      // Prevent battle creator from joining their own battle
      if (battle.creator_wallet === walletAddress) {
        res.status(400).json({
          success: false,
          error: 'Battle creator cannot join their own battle'
        });
        return;
      }

      // ATOMIC OPERATION: Try to join as participant 1 first
      let { data: updatedBattle, error: updateError } = await supabaseAdmin
        .from('battles')
        .update({ 
          participant1_wallet: walletAddress,
          status: 'waiting'
        })
        .eq('id', id)
        .eq('status', 'waiting')
        .is('participant1_wallet', null)
        .or(`participant2_wallet.is.null,participant2_wallet.neq.${walletAddress}`) // Handle NULL properly
        .select()
        .single();

      // If participant1 update failed, check if user is already a participant
      if (updateError || !updatedBattle) {
        const { data: currentBattle } = await supabaseAdmin
          .from('battles')
          .select('*')
          .eq('id', id)
          .single();
        
        if (currentBattle?.participant1_wallet === walletAddress || 
            currentBattle?.participant2_wallet === walletAddress) {
          // User is already a participant, return success
          res.json({ 
            success: true,
            data: currentBattle
          });
          return;
        }
      }

      // If participant1 slot is taken, try participant2 slot
      if (updateError || !updatedBattle) {
        // Use the battle we already fetched above

        // Check if battle is full
        if (battle.participant1_wallet && battle.participant2_wallet) {
          res.status(400).json({
            success: false,
            error: 'Battle is full - only the first 2 users can participate'
          });
          return;
        }

        // Check if battle is not in waiting status
        if (battle.status !== 'waiting') {
          res.status(400).json({
            success: false,
            error: 'Battle is not accepting participants'
          });
          return;
        }

        // Try to join as participant 2 (atomic operation)
        const result = await supabaseAdmin
          .from('battles')
          .update({ 
            participant2_wallet: walletAddress,
            status: 'active' // Battle becomes active when second participant joins
          })
          .eq('id', id)
          .eq('status', 'waiting')
          .not('participant1_wallet', 'is', null)
          .is('participant2_wallet', null)
          .neq('participant1_wallet', walletAddress)
          .select()
          .single();

        if (result.error || !result.data) {
          // If the atomic update failed, it means another user took the slot
          // Let's fetch the current battle state to provide better error message
          const { data: currentBattle } = await supabaseAdmin
            .from('battles')
            .select('*')
            .eq('id', id)
            .single();
          
          if (currentBattle?.participant1_wallet === walletAddress || currentBattle?.participant2_wallet === walletAddress) {
            // User is already a participant, return success
            res.json({ 
              success: true,
              data: currentBattle
            });
            return;
          }
          
          res.status(400).json({
            success: false,
            error: 'Failed to join battle - slot may have been taken by another user'
          });
          return;
        }

        updatedBattle = result.data;
        updateError = null; // Clear the error since participant2 join succeeded
      }
      
      if (updateError) {
        throw updateError;
      }
      
      res.json({ 
        success: true,
        data: updatedBattle
      });
    } catch (err) {
      const error = err as Error;
      console.error('Error joining battle:', error);
      const includeDetails = config.server.nodeEnv !== 'production';
      res.status(500).json({ 
        success: false,
        error: 'Failed to join battle',
        ...(includeDetails ? { message: error.message } : {})
      });
    }
  }

  /**
   * Submit prompt for a battle participant
   */
  static async submitPrompt(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { promptCompletion } = req.body;
      const walletAddress = req.user?.wallet?.address;

      if (!walletAddress) {
        res.status(403).json({
          success: false,
          error: 'Wallet required',
        });
        return;
      }

      if (!promptCompletion || typeof promptCompletion !== 'string' || promptCompletion.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'Prompt completion is required',
        });
        return;
      }

      // Get the battle to check participant status and concept
      const { data: battle, error: fetchError } = await supabaseAdmin
        .from('battles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError || !battle) {
        res.status(404).json({
          success: false,
          error: 'Battle not found'
        });
        return;
      }

      // Check if user is a participant
      const isParticipant1 = battle.participant1_wallet === walletAddress;
      const isParticipant2 = battle.participant2_wallet === walletAddress;
      
      if (!isParticipant1 && !isParticipant2) {
        res.status(403).json({
          success: false,
          error: 'Only battle participants can submit prompts'
        });
        return;
      }

      // Check if battle is in active status (ready for prompt submission)
      if (battle.status !== 'active') {
        res.status(400).json({
          success: false,
          error: 'Battle is not in active status for prompt submission'
        });
        return;
      }

      // Check if user has already submitted a prompt
      const existingPrompt = isParticipant1 ? battle.participant1_prompt : battle.participant2_prompt;
      if (existingPrompt) {
        res.status(400).json({
          success: false,
          error: 'You have already submitted a prompt for this battle'
        });
        return;
      }

      // Create the full prompt (concept + user completion)
      const fullPrompt = `${battle.concept} ${promptCompletion.trim()}`;

      // Update the appropriate participant prompt field
      const updateData: any = {};
      if (isParticipant1) {
        updateData.participant1_prompt = fullPrompt;
      } else {
        updateData.participant2_prompt = fullPrompt;
      }

      // Check if both prompts are now submitted to update status
      const otherParticipantPrompt = isParticipant1 ? battle.participant2_prompt : battle.participant1_prompt;
      if (otherParticipantPrompt) {
        // Both prompts are now submitted, update status to prompts_submitted
        updateData.status = 'prompts_submitted';
        updateData.image_generation_status = 'generating';
      }

      const { data: updatedBattle, error: updateError } = await supabaseAdmin
        .from('battles')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (updateError || !updatedBattle) {
        throw updateError;
      }

      let finalBattle = updatedBattle;

      // Ensure status reflects both prompts even under concurrent submissions
      if (
        updatedBattle.participant1_prompt &&
        updatedBattle.participant2_prompt &&
        updatedBattle.status !== 'prompts_submitted'
      ) {
        const { data: statusSyncedBattle, error: statusUpdateError } = await supabaseAdmin
          .from('battles')
          .update({ 
            status: 'prompts_submitted',
            image_generation_status: 'generating'
          })
          .eq('id', id)
          .select()
          .single();

        if (statusUpdateError || !statusSyncedBattle) {
          throw statusUpdateError || new Error('Failed to update battle status after prompt submission');
        }

        finalBattle = statusSyncedBattle;
      }

      // Trigger image generation if both prompts are submitted
      if (
        finalBattle.participant1_prompt &&
        finalBattle.participant2_prompt &&
        finalBattle.status === 'prompts_submitted'
      ) {
        // Start image generation asynchronously (don't await to avoid blocking response)
        BattleController.generateImagesForBattle(finalBattle.id, finalBattle.participant1_prompt, finalBattle.participant2_prompt)
          .catch(error => {
            console.error('Error generating images for battle:', finalBattle.id, error);
            // Update battle status to failed
            supabaseAdmin
              .from('battles')
              .update({ image_generation_status: 'failed' })
              .eq('id', finalBattle.id)
              .then(({ error: updateError }) => {
                if (updateError) {
                  console.error('Error updating battle status to failed:', updateError);
                }
              });
          });
      }
      
      res.json({ 
        success: true,
        data: {
          battle: finalBattle,
          message: 'Prompt submitted successfully',
          fullPrompt: fullPrompt
        }
      });
    } catch (err) {
      const error = err as Error;
      console.error('Error submitting prompt:', error);
      const includeDetails = config.server.nodeEnv !== 'production';
      res.status(500).json({ 
        success: false,
        error: 'Failed to submit prompt',
        ...(includeDetails ? { message: error.message } : {})
      });
    }
  }

  /**
   * Generate images for a battle (private method called asynchronously)
   */
  private static async generateImagesForBattle(battleId: string, participant1Prompt: string, participant2Prompt: string): Promise<void> {
    const startTime = new Date().toISOString();
    
    try {
      console.log(`Starting image generation for battle ${battleId}`);
      
      // Update battle status to generating and set start timestamps
      const { error: statusError } = await supabaseAdmin
        .from('battles')
        .update({
          image_generation_status: 'generating',
          participant1_generation_status: 'generating',
          participant2_generation_status: 'generating',
          participant1_generation_started_at: startTime,
          participant2_generation_started_at: startTime
        })
        .eq('id', battleId);

      if (statusError) {
        throw statusError;
      }
      
      // Generate images using fal.ai
      const imageResults = await FalService.generateBattleImages(participant1Prompt, participant2Prompt);
      const completedTime = new Date().toISOString();
      
      // Update battle with image URLs and completion status
      const { error: updateError } = await supabaseAdmin
        .from('battles')
        .update({
          participant1_image_url: imageResults.participant1ImageUrl,
          participant2_image_url: imageResults.participant2ImageUrl,
          image_generation_status: 'completed',
          participant1_generation_status: 'completed',
          participant2_generation_status: 'completed',
          participant1_generation_completed_at: completedTime,
          participant2_generation_completed_at: completedTime
        })
        .eq('id', battleId);

      if (updateError) {
        throw updateError;
      }

      console.log(`Successfully generated images for battle ${battleId}`);

      // Deploy contract and create battle on-chain for voting
      try {
        console.log(`🚀 Starting contract deployment for battle ${battleId}...`);
        
        // Deploy contract if not already deployed
        if (!ContractDeploymentService.isDeployed()) {
          await ContractDeploymentService.deployContract();
        }

        // Get the updated battle with image URLs
        const { data: updatedBattle, error: fetchError } = await supabaseAdmin
          .from('battles')
          .select('*')
          .eq('id', battleId)
          .single();

        if (fetchError || !updatedBattle) {
          throw new Error('Failed to fetch updated battle data');
        }

        // Create battle on contract
        const contractAddress = await ContractDeploymentService.createBattleOnContract(updatedBattle);
        
        // Generate voting QR code with contract information
        const votingQRData = ContractDeploymentService.generateVotingQRData(updatedBattle);
        
        // Update battle with voting QR data and contract address
        const { error: qrUpdateError } = await supabaseAdmin
          .from('battles')
          .update({
            voting_qr_data: votingQRData,
            status: 'voting'
          })
          .eq('id', battleId);

        if (qrUpdateError) {
          throw qrUpdateError;
        }

        console.log(`✅ Contract deployment and voting setup completed for battle ${battleId}`);
        console.log(`📍 Contract Address: ${contractAddress}`);
        console.log(`🔗 Battle is now in voting phase`);
        
      } catch (contractError) {
        console.error(`❌ Contract deployment failed for battle ${battleId}:`, contractError);
        // Don't throw here - image generation succeeded, contract deployment is optional
        // We can still proceed with the battle without on-chain voting
      }
    } catch (error) {
      console.error(`Failed to generate images for battle ${battleId}:`, error);
      const failedTime = new Date().toISOString();
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Update battle status to failed for both participants
      await supabaseAdmin
        .from('battles')
        .update({ 
          image_generation_status: 'failed',
          participant1_generation_status: 'failed',
          participant2_generation_status: 'failed',
          participant1_generation_error: errorMessage,
          participant2_generation_error: errorMessage
        })
        .eq('id', battleId);
      
      throw error;
    }
  }

  /**
   * Retry image generation for a specific participant
   */
  static async retryImageGeneration(req: Request, res: Response): Promise<void> {
    try {
      const { battleId } = req.params;
      const { participant } = req.body; // 'participant1' or 'participant2'
      const walletAddress = req.user?.wallet?.address;

      if (!walletAddress) {
        res.status(403).json({
          success: false,
          error: 'Wallet required',
        });
        return;
      }

      if (!participant || !['participant1', 'participant2'].includes(participant)) {
        res.status(400).json({
          success: false,
          error: 'Invalid participant. Must be participant1 or participant2',
        });
        return;
      }

      // Get battle details
      const { data: battle, error: fetchError } = await supabaseAdmin
        .from('battles')
        .select('*')
        .eq('id', battleId)
        .single();

      if (fetchError || !battle) {
        res.status(404).json({
          success: false,
          error: 'Battle not found',
        });
        return;
      }

      // Check if user is the battle creator
      if (battle.creator_wallet !== walletAddress) {
        res.status(403).json({
          success: false,
          error: 'Only battle creator can retry image generation',
        });
        return;
      }

      // Check if participant has a prompt
      const promptField = participant === 'participant1' ? 'participant1_prompt' : 'participant2_prompt';
      const prompt = battle[promptField];
      
      if (!prompt) {
        res.status(400).json({
          success: false,
          error: `${participant} has no prompt to generate image from`,
        });
        return;
      }

      // Reset the specific participant's generation status
      const statusField = `${participant}_generation_status`;
      const startedAtField = `${participant}_generation_started_at`;
      const completedAtField = `${participant}_generation_completed_at`;
      const errorField = `${participant}_generation_error`;
      const imageUrlField = `${participant}_image_url`;

      const updateData: any = {
        [statusField]: 'generating',
        [startedAtField]: new Date().toISOString(),
        [completedAtField]: null,
        [errorField]: null
      };

      const { error: resetError } = await supabaseAdmin
        .from('battles')
        .update(updateData)
        .eq('id', battleId);

      if (resetError) {
        throw resetError;
      }

      // Generate image for the specific participant
      try {
        const imageResult = await FalService.generateImage(prompt);
        const completedTime = new Date().toISOString();

        // Update with successful result
        const { error: successError } = await supabaseAdmin
          .from('battles')
          .update({
            [statusField]: 'completed',
            [completedAtField]: completedTime,
            [imageUrlField]: imageResult.imageUrl
          })
          .eq('id', battleId);

        if (successError) {
          throw successError;
        }

        res.json({
          success: true,
          data: {
            participant,
            imageUrl: imageResult.imageUrl,
            status: 'completed'
          }
        });
      } catch (generationError) {
        const errorMessage = generationError instanceof Error ? generationError.message : 'Unknown error';
        
        // Update with error
        await supabaseAdmin
          .from('battles')
          .update({
            [statusField]: 'failed',
            [errorField]: errorMessage
          })
          .eq('id', battleId);

        res.status(500).json({
          success: false,
          error: 'Failed to generate image',
          details: errorMessage
        });
      }
    } catch (err) {
      const error = err as Error;
      console.error('Error retrying image generation:', error);
      const includeDetails = config.server.nodeEnv !== 'production';
      res.status(500).json({
        success: false,
        error: 'Failed to retry image generation',
        ...(includeDetails ? { message: error.message } : {})
      });
    }
  }
}
