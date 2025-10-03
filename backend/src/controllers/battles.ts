import { Request, Response } from 'express';
import { supabaseAdmin, config } from '../config/config.js';
import { BattleConceptService } from '../services/battle-concept.js';
import { QRGeneratorService } from '../services/qr-generator.js';
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
      
      if (updateError) {
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
        .or(`participant2_wallet.is.null,participant2_wallet.neq.${walletAddress}`)
        .select()
        .single();

      // If participant1 update failed, check if user is already participant1
      if (updateError || !updatedBattle) {
        const { data: currentBattle } = await supabaseAdmin
          .from('battles')
          .select('*')
          .eq('id', id)
          .single();
        
        if (currentBattle?.participant1_wallet === walletAddress) {
          // User is already participant1, return success
          res.json({ 
            success: true,
            data: currentBattle
          });
          return;
        }
      }

      // If participant1 slot is taken, try participant2 slot
      if (updateError || !updatedBattle) {
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

        // Check if user is already a participant
        if (battle.participant1_wallet === walletAddress || battle.participant2_wallet === walletAddress) {
          res.status(400).json({
            success: false,
            error: 'Already a participant in this battle'
          });
          return;
        }

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
}
