import { getAccessToken } from '@privy-io/react-auth';

const API_BASE_URL = 'http://localhost:3001';

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
    const response = await fetch(`${API_BASE_URL}/api/messages`, {
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
    const response = await fetch(`${API_BASE_URL}/api/messages`, {
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
    const response = await fetch(`${API_BASE_URL}/api/messages/enhanced`, {
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
    const response = await fetch(`${API_BASE_URL}/api/messages/enhance`, {
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
    const response = await fetch(`${API_BASE_URL}/api/messages/enhancement-options`, {
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
    const response = await fetch(`${API_BASE_URL}/api/messages/${id}`, {
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
    const response = await fetch(`${API_BASE_URL}/api/messages/${id}`, {
      method: 'DELETE',
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },
};
