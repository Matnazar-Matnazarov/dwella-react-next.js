import axiosClient from './client';

// Types
export interface Master {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  picture: string;
  role: string;
  is_active: boolean;
  is_online: boolean;
  created_at: string;
  industries: Array<{
    id: number;
    name: string;
    price: number;
    star: number;
  }>;
  like_count: number;
  dislike_count: number;
}

export interface IndustryRequest {
  industry_id: number;
  price?: number;
  internship?: string;
}

// Get all masters
export const getMasters = async (page: number = 1, filters?: object) => {
  try {
    const params = { page, role: 'MASTER', ...filters };
    const response = await axiosClient.get<{ results: Master[], count: number }>('/accounts/users/', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get single master
export const getMaster = async (id: number) => {
  try {
    const response = await axiosClient.get<Master>(`/accounts/users/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get master industries
export const getMasterIndustries = async (id: number) => {
  try {
    const response = await axiosClient.get(`/industry/user/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Add industry to master
export const addIndustryToMaster = async (data: IndustryRequest) => {
  try {
    const response = await axiosClient.post('/industry/user/', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update master industry
export const updateMasterIndustry = async (id: number, data: Partial<IndustryRequest>) => {
  try {
    const response = await axiosClient.patch(`/industry/user/${id}/`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Remove industry from master
export const removeIndustryFromMaster = async (id: number) => {
  try {
    await axiosClient.delete(`/industry/user/${id}/`);
    return true;
  } catch (error) {
    throw error;
  }
};

// Like/Dislike master
export const likeMaster = async (masterId: number, isLike: boolean) => {
  try {
    const response = await axiosClient.post('/accounts/like/', {
      master: masterId,
      is_like: isLike
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}; 