/**
 * API Context Provider
 * 
 * TECHNOLOGY: React Context API with Axios HTTP client
 * WHY: Centralized API communication management without prop drilling
 * - Context provides API base URL and methods globally
 * - Axios handles HTTP requests with automatic error handling
 * - Can add auth token to all requests via interceptors
 * 
 * NEXORA ARCHITECTURE FIT:
 * - Wraps entire app to provide API methods to any component
 * - Supports authentication token injection for protected routes
 * - Foundation for real-time messaging and escrow transaction APIs
 * - Single source of truth for API configuration
 */

import React, { createContext, useContext } from "react";
import axios from "axios";

const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
  const apiClient = axios.create({
    baseURL: (import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5001/api" : "/api")).replace(/\/$/, ""),
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Interceptor: Add auth token to all requests
  apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Interceptor: Handle errors globally
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401 && localStorage.getItem("token")) {
        // Token expired or invalid - clear storage and redirect to login
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );

  const apiMethods = {
    // Auth endpoints
    register: (data) => apiClient.post("/auth/register", data),
    login: (data) => apiClient.post("/auth/login", data),

    // User endpoints
    getUser: (id) => apiClient.get(`/users/${id}`),
    updateProfile: (data) => apiClient.put(`/users/profile`, data),
    uploadAvatar: (formData) => apiClient.post(`/users/upload-avatar`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),

    // Projects endpoints (placeholder)
    getProjects: () => apiClient.get("/projects"),
    createProject: (data) => apiClient.post("/projects", data),

  // Jobs endpoints
  createJob: (data) => apiClient.post('/jobs', data),
  listJobs: (params) => apiClient.get('/jobs', { params }),
  getJob: (id) => apiClient.get(`/jobs/${id}`),
  updateJob: (id, data) => apiClient.put(`/jobs/${id}`, data),
  deleteJob: (id) => apiClient.delete(`/jobs/${id}`),

    // Messaging endpoints (placeholder)
    getConversations: () => apiClient.get("/messages"),
    startConversation: (recipientId) => apiClient.post("/messages", { recipientId }),
    getMessages: (conversationId) => apiClient.get(`/messages/${conversationId}`),
    sendMessage: (conversationId, content) => apiClient.post(`/messages/${conversationId}`, { content }),

    // Payments endpoints (placeholder)
    getEscrowTransactions: () => apiClient.get("/payments"),
    initiatePayment: (data) => apiClient.post("/payments", data),
  };

  return (
    <ApiContext.Provider value={apiMethods}>{children}</ApiContext.Provider>
  );
};

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error("useApi must be used within ApiProvider");
  }
  return context;
};
