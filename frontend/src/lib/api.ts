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

// API functions with authentication
export const api = {
  // Get all messages
  async getMessages() {
    const headers = await getAuthHeaders();
    const response = await fetch(buildUrl('/api/messages'), {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Create a new message
  async createMessage(content: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(buildUrl('/api/messages'), {
      method: 'POST',
      headers,
      body: JSON.stringify({ content }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Create an enhanced message (automatically enhances the content)
  async createEnhancedMessage(content: string, enhancementType: string = 'clarity', targetAudience: string = 'general') {
    const headers = await getAuthHeaders();
    const response = await fetch(buildUrl('/api/messages/enhanced'), {
      method: 'POST',
      headers,
      body: JSON.stringify({ 
        content,
        enhancementType,
        targetAudience,
        autoEnhance: true
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Enhance a message without saving
  async enhanceMessage(content: string, enhancementType: string = 'clarity', targetAudience: string = 'general') {
    const headers = await getAuthHeaders();
    const response = await fetch(buildUrl('/api/messages/enhance'), {
      method: 'POST',
      headers,
      body: JSON.stringify({ 
        originalMessage: content,
        enhancementType,
        targetAudience
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Get enhancement options
  async getEnhancementOptions() {
    const headers = await getAuthHeaders();
    const response = await fetch(buildUrl('/api/messages/enhancement-options'), {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Update a message
  async updateMessage(id: string, content: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(buildUrl(`/api/messages/${id}`), {
      method: 'PUT',
      headers,
      body: JSON.stringify({ content }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Delete a message
  async deleteMessage(id: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(buildUrl(`/api/messages/${id}`), {
      method: 'DELETE',
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Battle API functions
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
};
