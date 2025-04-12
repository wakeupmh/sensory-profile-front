/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const assessmentApi = {
  getAllAssessments: async (token: string | null) => {
    try {
      const response = await api.get('/api/assessments', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating assessment:', error);
      throw error;
    }
  },

  // Update assessment
  updateAssessment: async (id: string, assessmentData: any, token: string | null) => {
    try {
      const response = await api.put(`/api/assessments/${id}`, assessmentData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating assessment ${id}:`, error);
      throw error;
    }
  },

  // Delete assessment
  deleteAssessment: async (id: string, token: string | null) => {
    try {
      const response = await api.delete(`/api/assessments/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error deleting assessment ${id}:`, error);
      throw error;
    }
  },

  // Generate report
  generateReport: async (id: string, token: string | null) => {
    try {
      const response = await api.get(`/api/assessments/${id}/report`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error generating report for assessment ${id}:`, error);
      throw error;
    }
  },
};

export default api;
