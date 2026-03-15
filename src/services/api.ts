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

export default api;
