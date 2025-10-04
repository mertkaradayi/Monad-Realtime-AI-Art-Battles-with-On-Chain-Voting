import { getAccessToken } from '@privy-io/react-auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

const buildUrl = (path: string) => {
  if (API_BASE_URL) {
    return `${API_BASE_URL}${path}`;
  }

  if (typeof window !== 'undefined') {
    return `${window.location.origin}${path}`;
  }

  return path;
};

// Helper function to get authenticated headers
export const getAuthHeaders = async () => {
  try {
    const token = await getAccessToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  } catch (error) {
    console.error('Failed to get access token:', error);
    throw new Error('Authentication required');
  }
};

// Helper function to handle API responses with authentication error handling
const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    if (response.status === 401) {
      // Authentication error - force re-authentication
      console.error('Authentication failed, user may need to re-authenticate');
      throw new Error('Authentication required - please reconnect your wallet');
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Battle API functions with authentication
export const api = {
  // Create a new battle
  async createBattle() {
    const headers = await getAuthHeaders();
    const response = await fetch(buildUrl('/api/battles'), {
      method: 'POST',
      headers,
    });
    
    return handleApiResponse(response);
  },

  // Get all battles
  async getBattles() {
    const headers = await getAuthHeaders();
    const response = await fetch(buildUrl('/api/battles'), {
      method: 'GET',
      headers,
    });
    
    return handleApiResponse(response);
  },

  // Get battles created by current user
  async getMyBattles() {
    const headers = await getAuthHeaders();
    const response = await fetch(buildUrl('/api/battles/my-battles'), {
      method: 'GET',
      headers,
    });
    
    return handleApiResponse(response);
  },

  // Get battle by ID
  async getBattle(id: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(buildUrl(`/api/battles/${id}`), {
      method: 'GET',
      headers,
    });
    
    return handleApiResponse(response);
  },

  // Join battle
  async joinBattle(id: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(buildUrl(`/api/battles/${id}/join`), {
      method: 'POST',
      headers,
    });
    
    return handleApiResponse(response);
  },

  // Submit prompt for battle
  async submitPrompt(id: string, promptCompletion: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(buildUrl(`/api/battles/${id}/submit-prompt`), {
      method: 'POST',
      headers,
      body: JSON.stringify({ promptCompletion }),
    });
    
    return handleApiResponse(response);
  },

  // Retry image generation for a specific participant
  async retryImageGeneration(battleId: string, participant: 'participant1' | 'participant2') {
    const headers = await getAuthHeaders();
    const response = await fetch(buildUrl(`/api/battles/${battleId}/retry-image-generation`), {
      method: 'POST',
      headers,
      body: JSON.stringify({ participant }),
    });
    
    return handleApiResponse(response);
  },
};
