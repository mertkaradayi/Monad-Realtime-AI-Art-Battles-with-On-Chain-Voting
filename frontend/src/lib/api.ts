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

// Battle API functions with authentication
export const api = {
  // Create a new battle
  async createBattle() {
    const headers = await getAuthHeaders();
    const response = await fetch(buildUrl('/api/battles'), {
      method: 'POST',
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Get all battles
  async getBattles() {
    const headers = await getAuthHeaders();
    const response = await fetch(buildUrl('/api/battles'), {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Get battle by ID
  async getBattle(id: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(buildUrl(`/api/battles/${id}`), {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Join battle
  async joinBattle(id: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(buildUrl(`/api/battles/${id}/join`), {
      method: 'POST',
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Submit prompt for battle
  async submitPrompt(id: string, promptCompletion: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(buildUrl(`/api/battles/${id}/submit-prompt`), {
      method: 'POST',
      headers,
      body: JSON.stringify({ promptCompletion }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },
};
