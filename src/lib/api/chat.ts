import axiosClient from './client';
import { getCookie } from 'cookies-next';

// Types
export interface Chat {
  id: number;
  connect_announcement: string;
  master: number;
  master_details: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    picture: string;
  };
  client: number;
  client_details: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    picture: string;
  };
  message: string;
  image?: string;
  created_at: string;
  sender_id?: number;
}

export interface ChatRequest {
  connect_announcement: string;
  master: number;
  client: number;
  message: string;
  image?: File;
}

// API URLs
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const WS_PROTOCOL = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || `${WS_PROTOCOL}//${typeof window !== 'undefined' ? window.location.host : 'localhost:8000'}`;

// Get chat history
export const getChatHistory = async (
  announcementId: string, 
  masterId: number, 
  clientId: number
): Promise<Chat[]> => {
  try {
    const response = await axiosClient.get<Chat[]>(
      `/chat/history/${announcementId}/${masterId}/${clientId}/`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get active chats
export const getActiveChats = async () => {
  try {
    const response = await axiosClient.get('/chat/get_active_chats/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Send message - for non-websocket fallback
export const sendMessage = async (data: ChatRequest) => {
  try {
    let formData;
    
    if (data.image) {
      formData = new FormData();
      formData.append('connect_announcement', data.connect_announcement);
      formData.append('master', String(data.master));
      formData.append('client', String(data.client));
      formData.append('message', data.message);
      formData.append('image', data.image);
      
      const response = await axiosClient.post<Chat>('/chat/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } else {
      // Regular JSON request without file
      const response = await axiosClient.post<Chat>('/chat/', {
        connect_announcement: data.connect_announcement,
        master: data.master,
        client: data.client,
        message: data.message
      });
      
      return response.data;
    }
  } catch (error) {
    throw error;
  }
};

// Create WebSocket connection
export const createChatWebSocket = (
  announcementId: string,
  masterId: number,
  clientId: number
): WebSocket => {
  const token = getCookie('access_token');
  
  // Create WebSocket connection with token authentication
  const socket = new WebSocket(
    `${WS_URL}/ws/chat/${announcementId}/${masterId}/${clientId}/?token=${token}`
  );
  
  // Connection opened
  socket.onopen = () => {
    console.log('WebSocket connection established');
  };
  
  // Connection closed
  socket.onclose = (event) => {
    console.log('WebSocket connection closed:', event);
  };
  
  // Connection error
  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  return socket;
}; 