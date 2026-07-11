import axiosInstance from './axios';

export const dashboardService = {
  getStats: async () => {
    const response = await axiosInstance.get('/dashboard/stats');
    return response.data;
  }
};
