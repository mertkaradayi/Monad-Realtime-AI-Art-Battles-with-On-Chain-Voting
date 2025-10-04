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
   * Generate QR code data URL for voting
   */
  static async generateVotingQR(battleId: string): Promise<string> {
    try {
      // Generate QR code that directly points to the voting page
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const votingUrl = `${baseUrl}/vote/${battleId}`;
      
      const qrDataURL = await QRCode.toDataURL(votingUrl, {
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
}
