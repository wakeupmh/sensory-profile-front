/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL;
if (!baseURL && import.meta.env.PROD) {
  throw new Error('VITE_API_URL environment variable is required in production');
}

const api = axios.create({
  baseURL: baseURL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

function getAuthHeaders(token: string | null): { Authorization: string } {
  if (!token) {
    throw new Error('Authentication token is missing. Please sign in.');
  }
  return { Authorization: `Bearer ${token}` };
}

export const assessmentApi = {
  getAllAssessments: async (token: string | null) => {
    try {
      const response = await api.get('/api/assessments', {
        headers: getAuthHeaders(token),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching assessments:', error);
      throw error;
    }
  },

  getAssessmentById: async (id: string, token: string | null) => {
    try {
      const response = await api.get(`/api/assessments/${id}`, {
        headers: getAuthHeaders(token),
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching assessment ${id}:`, error);
      throw error;
    }
  },

  createAssessment: async (assessmentData: any, token: string | null) => {
    try {
      const response = await api.post('/api/assessments', assessmentData, {
        headers: getAuthHeaders(token),
      });
      return response.data;
    } catch (error) {
      console.error('Error creating assessment:', error);
      throw error;
    }
  },

  updateAssessment: async (id: string, assessmentData: any, token: string | null) => {
    try {
      const response = await api.put(`/api/assessments/${id}`, assessmentData, {
        headers: getAuthHeaders(token),
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating assessment ${id}:`, error);
      throw error;
    }
  },

  deleteAssessment: async (id: string, token: string | null) => {
    try {
      const response = await api.delete(`/api/assessments/${id}`, {
        headers: getAuthHeaders(token),
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting assessment ${id}:`, error);
      throw error;
    }
  },

  generateReport: async (id: string, token: string | null) => {
    try {
      const response = await api.get(`/api/assessments/${id}/report`, {
        headers: getAuthHeaders(token),
      });
      return response.data;
    } catch (error) {
      console.error(`Error generating report for assessment ${id}:`, error);
      throw error;
    }
  },
};

export const anamneseApi = {
  list: async (token: string | null) => {
    try {
      const response = await api.get('/api/anamneses', {
        headers: getAuthHeaders(token),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching anamneses:', error);
      throw error;
    }
  },

  getById: async (id: string, token: string | null) => {
    try {
      const response = await api.get(`/api/anamneses/${id}`, {
        headers: getAuthHeaders(token),
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching anamnese ${id}:`, error);
      throw error;
    }
  },

  create: async (data: any, token: string | null) => {
    try {
      const response = await api.post('/api/anamneses', data, {
        headers: getAuthHeaders(token),
      });
      return response.data;
    } catch (error) {
      console.error('Error creating anamnese:', error);
      throw error;
    }
  },

  update: async (id: string, data: any, token: string | null) => {
    try {
      const response = await api.put(`/api/anamneses/${id}`, data, {
        headers: getAuthHeaders(token),
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating anamnese ${id}:`, error);
      throw error;
    }
  },

  remove: async (id: string, token: string | null) => {
    try {
      const response = await api.delete(`/api/anamneses/${id}`, {
        headers: getAuthHeaders(token),
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting anamnese ${id}:`, error);
      throw error;
    }
  },

  generateShareLink: async (id: string, token: string | null) => {
    try {
      const response = await api.post(`/api/anamneses/${id}/share`, {}, {
        headers: getAuthHeaders(token),
      });
      return response.data as { shareToken: string; sharedAt?: string };
    } catch (error) {
      console.error(`Error generating share link for anamnese ${id}:`, error);
      throw error;
    }
  },

  revokeShareLink: async (id: string, token: string | null) => {
    try {
      const response = await api.delete(`/api/anamneses/${id}/share`, {
        headers: getAuthHeaders(token),
      });
      return response.data;
    } catch (error) {
      console.error(`Error revoking share link for anamnese ${id}:`, error);
      throw error;
    }
  },

  // Public endpoint — intentionally omits Authorization header.
  getBySharedToken: async (shareToken: string) => {
    try {
      const response = await api.get(`/api/anamneses/shared/${shareToken}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching shared anamnese ${shareToken}:`, error);
      throw error;
    }
  },
};

export default api;
