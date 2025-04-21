import axiosClient from './client';
import axios from 'axios';
import { setCookie, deleteCookie } from 'cookies-next';

// API URLs
const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://127.0.0.1:8000';
console.log('Auth API URL:', API_URL);

// Types
export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role: 'CLIENT' | 'MASTER';
  first_name?: string;
  last_name?: string;
  phone_number?: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    is_active: boolean;
    picture?: string;
  };
}

// Login function
export const login = async (data: LoginData): Promise<AuthResponse> => {
  try {
    const response = await axios.post<AuthResponse>(`${API_URL}/api/token/`, data);
    
    // Save tokens to cookies
    setCookie('access_token', response.data.access, { maxAge: 60 * 60 * 24 }); // 1 day
    setCookie('refresh_token', response.data.refresh, { maxAge: 60 * 60 * 24 * 7 }); // 7 days
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Register function
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    const headers = apiKey ? { 'X-API-Key': apiKey } : {};
    
    const response = await axios.post<AuthResponse>(`${API_URL}/accounts/register/`, data, { headers });
    
    // Save tokens to cookies if returned
    if (response.data.access && response.data.refresh) {
      setCookie('access_token', response.data.access, { maxAge: 60 * 60 * 24 }); // 1 day
      setCookie('refresh_token', response.data.refresh, { maxAge: 60 * 60 * 24 * 7 }); // 7 days
    }
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Google login function
export const googleLogin = async (accessToken: string): Promise<AuthResponse> => {
  console.log('Attempting Google login with token');
  
  // Get API key from environment variables
  const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'kufQGmDG.LuPMfWoS5SOkSZAjr7gMPMDsRtWmHWnD';
  console.log('Using API key:', apiKey);
  
  // Try direct fetch instead of axios
  const url = `${API_URL}/api/google/login/`;
  
  try {
    console.log('Making fetch request to:', url);
    
    // First try the POST method directly 
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({ access_token: accessToken }),
      credentials: 'include',
    });
    
    // Always get the response text for debugging
    const responseText = await response.text();
    console.log(`Server response (${response.status}):`, responseText);
    
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}: ${responseText}`);
    }
    
    // Parse JSON only if the response was successful
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Invalid JSON response: ${responseText}`);
    }
    
    console.log('Google login successful');
    
    // Save tokens to cookies
    if (data.access) {
      setCookie('access_token', data.access, { maxAge: 60 * 60 * 24 }); // 1 day
    }
    
    if (data.refresh) {
      setCookie('refresh_token', data.refresh, { maxAge: 60 * 60 * 24 * 7 }); // 7 days
    }
    
    return data;
    
  } catch (error) {
    console.error('Error with primary endpoint:', error);
    
    // Try fallback endpoint
    const fallbackUrl = `${API_URL}/api/google-login/`;
    console.log('Trying fallback endpoint:', fallbackUrl);
    
    try {
      const fallbackResponse = await fetch(fallbackUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify({ access_token: accessToken }),
        credentials: 'include',
      });
      
      // Always get the response text for debugging
      const fallbackResponseText = await fallbackResponse.text();
      console.log(`Fallback server response (${fallbackResponse.status}):`, fallbackResponseText);
      
      if (!fallbackResponse.ok) {
        throw new Error(`Fallback request failed with status ${fallbackResponse.status}: ${fallbackResponseText}`);
      }
      
      // Parse JSON only if the response was successful
      let fallbackData;
      try {
        fallbackData = JSON.parse(fallbackResponseText);
      } catch (e) {
        throw new Error(`Invalid JSON response from fallback: ${fallbackResponseText}`);
      }
      
      console.log('Google login successful with fallback endpoint');
      
      // Save tokens to cookies
      if (fallbackData.access) {
        setCookie('access_token', fallbackData.access, { maxAge: 60 * 60 * 24 }); // 1 day
      }
      
      if (fallbackData.refresh) {
        setCookie('refresh_token', fallbackData.refresh, { maxAge: 60 * 60 * 24 * 7 }); // 7 days
      }
      
      return fallbackData;
      
    } catch (fallbackError) {
      console.error('Error with fallback endpoint:', fallbackError);
      throw fallbackError;
    }
  }
};

// Logout function
export const logout = async (): Promise<void> => {
  try {
    const refresh_token = localStorage.getItem('refresh_token');
    if (refresh_token) {
      await axiosClient.post('/api/token/blacklist/', {
        refresh_token,
      });
    }
    
    // Remove tokens from cookies
    deleteCookie('access_token');
    deleteCookie('refresh_token');
    
    // Clear localStorage too for safety
    localStorage.removeItem('refresh_token');
  } catch (error) {
    // Even on error, remove tokens
    deleteCookie('access_token');
    deleteCookie('refresh_token');
    localStorage.removeItem('refresh_token');
    throw error;
  }
};

// Refresh token function - prefer to use axios directly to avoid circular import
export const refreshAccessToken = async (refreshToken: string): Promise<string> => {
  try {
    const response = await axios.post<{ access: string }>(`${API_URL}/api/token/refresh/`, {
      refresh: refreshToken,
    });
    
    return response.data.access;
  } catch (error) {
    throw error;
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const response = await axiosClient.get('/accounts/user/');
    return response.data;
  } catch (error) {
    throw error;
  }
}; 