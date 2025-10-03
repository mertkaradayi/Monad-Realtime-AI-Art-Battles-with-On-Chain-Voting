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

      // Get current battle
      const { data: battle, error: fetchError } = await supabaseAdmin
        .from('battles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError) {
        throw fetchError;
      }

      if (!battle) {
        res.status(404).json({
          success: false,
          error: 'Battle not found'
        });
        return;
      }

      if (battle.status !== 'waiting') {
        res.status(400).json({
          success: false,
          error: 'Battle is not accepting participants'
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

      // Assign participant position
      let updateData: any = {};
      let newStatus = 'waiting';

      if (!battle.participant1_wallet) {
        updateData.participant1_wallet = walletAddress;
      } else if (!battle.participant2_wallet) {
        updateData.participant2_wallet = walletAddress;
        newStatus = 'active'; // Battle becomes active when second participant joins
      } else {
        res.status(400).json({
          success: false,
          error: 'Battle is full'
        });
        return;
      }

      updateData.status = newStatus;

      // Update battle
      const { data: updatedBattle, error: updateError } = await supabaseAdmin
        .from('battles')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
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
