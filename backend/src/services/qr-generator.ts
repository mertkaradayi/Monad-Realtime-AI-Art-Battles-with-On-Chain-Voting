import QRCode from 'qrcode';

export class QRGeneratorService {
  /**
   * Generate QR code data URL for battle joining
   */
  static async generateJoiningQR(battleId: string): Promise<string> {
    try {
      // For testing: Create a URL that points to localhost join page
      // In production, this would be your actual domain
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const joinUrl = `${baseUrl}/join/${battleId}`;
      
      const qrDataURL = await QRCode.toDataURL(joinUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      return qrDataURL;
    } catch (error) {
      console.error('QR code generation error:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Generate QR code data URL for voting with monad:// payload
   */
  static async generateVotingQR(battleId: string, contractAddress?: string, participant1Address?: string, participant2Address?: string): Promise<string> {
    try {
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const votingUrl = `${baseUrl}/vote/${battleId}`;
      
      // Create monad:// payload for direct wallet integration
      const monadPayload = {
        type: 'battle_vote',
        battleId: battleId,
        contractAddress: contractAddress || '',
        participant1: participant1Address || '',
        participant2: participant2Address || '',
        network: 'monad_testnet',
        chainId: 10143,
        timestamp: Date.now(),
        fallbackUrl: votingUrl
      };
      
      // Create the monad:// URL
      const monadUrl = `monad://battle-vote?data=${encodeURIComponent(JSON.stringify(monadPayload))}`;
      
      // For QR code, we'll include both the monad:// URL and fallback web URL
      const qrData = {
        monad: monadUrl,
        web: votingUrl,
        payload: monadPayload
      };
      
      const qrDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      return qrDataURL;
    } catch (error) {
      console.error('QR code generation error:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Generate QR code data URL from custom voting data
   */
  static async generateVotingQRFromData(votingData: string): Promise<string> {
    try {
      const qrDataURL = await QRCode.toDataURL(votingData, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      return qrDataURL;
    } catch (error) {
      console.error('QR code generation error:', error);
      throw new Error('Failed to generate voting QR code');
    }
  }

  /**
   * Parse QR code data
   */
  static parseQRData(qrString: string): { type: string; battleId: string; timestamp: string } | null {
    try {
      const data = JSON.parse(qrString);
      if (data.type && data.battleId && data.timestamp) {
        return data;
      }
      return null;
    } catch (error) {
      console.error('QR code parsing error:', error);
      return null;
    }
  }

  /**
   * Parse monad:// QR code data for battle voting
   */
  static parseMonadQRData(qrString: string): {
    type: string;
    battleId: string;
    contractAddress: string;
    participant1: string;
    participant2: string;
    network: string;
    chainId: number;
    timestamp: number;
    fallbackUrl: string;
  } | null {
    try {
      const data = JSON.parse(qrString);
      
      // Check if it's a monad QR code with payload
      if (data.payload && data.payload.type === 'battle_vote') {
        return data.payload;
      }
      
      // Check if it's a direct monad:// URL
      if (data.monad && data.monad.startsWith('monad://battle-vote')) {
        const url = new URL(data.monad);
        const payloadData = url.searchParams.get('data');
        if (payloadData) {
          return JSON.parse(decodeURIComponent(payloadData));
        }
      }
      
      return null;
    } catch (error) {
      console.error('Monad QR code parsing error:', error);
      return null;
    }
  }
}
