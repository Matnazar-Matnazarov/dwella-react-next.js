import axiosClient from './client';

// Types
export interface Announcement {
  id: string;
  guid: string;
  name: string;
  title: string;
  description: string;
  client: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  location: {
    type: string;
    coordinates: [number, number];
  };
  address: string;
  industry: object;
  slug: string;
  images: Array<{
    id: string;
    name: string;
  }>;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface AnnouncementRequest {
  name: string;
  title: string;
  description?: string;
  location?: {
    type: string;
    coordinates: [number, number];
  };
  address?: string;
  industry?: object;
}

// Get all announcements
export const getAnnouncements = async (page: number = 1, filters?: object) => {
  try {
    const params = { page, ...filters };
    const response = await axiosClient.get<{ results: Announcement[], count: number }>('/announcements/', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get single announcement
export const getAnnouncement = async (id: string) => {
  try {
    const response = await axiosClient.get<Announcement>(`/announcements/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create announcement
export const createAnnouncement = async (data: AnnouncementRequest) => {
  try {
    const response = await axiosClient.post<Announcement>('/announcements/', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update announcement
export const updateAnnouncement = async (id: string, data: Partial<AnnouncementRequest>) => {
  try {
    const response = await axiosClient.patch<Announcement>(`/announcements/${id}/`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete announcement
export const deleteAnnouncement = async (id: string) => {
  try {
    await axiosClient.delete(`/announcements/${id}/`);
    return true;
  } catch (error) {
    throw error;
  }
};

// Upload image to announcement
export const uploadAnnouncementImage = async (id: string, file: File) => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('announcement_id', id);
    
    const response = await axiosClient.post('/images/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    throw error;
  }
}; 