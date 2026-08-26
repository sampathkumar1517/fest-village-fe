import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const path = window.location.pathname;
      if (path.startsWith("/login") || path.startsWith("/register")) {
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

function unwrapList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (response?.listData?.[0]?.data) return response.listData[0].data;
  return [];
}

// ================= Auth =================
export const login = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  if (response.data.access_token) {
    localStorage.setItem("access_token", response.data.access_token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
  }
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

// ================= Festival =================
export const createFestival = async (festivalData) => {
  const response = await api.post("/festival/create-festival", festivalData);
  return response.data;
};

export const getFestivals = async () => {
  const response = await api.get("/festival");
  return response.data;
};

export const getFestivalsList = async () => {
  const response = await getFestivals();
  return unwrapList(response);
};

export const deleteFestival = async (id) => {
  const response = await api.delete(`/festival/${id}`);
  return response.data;
};

export const getFestivalSummary = async (id) => {
  const response = await api.get(`/festival/${id}/summary`);
  return response.data;
};

// ================= Users =================
export const createUser = async (userData) => {
  const response = await api.post("/users/create-user", userData);
  return response.data;
};

export const getUsers = async () => {
  const response = await api.get("/users");
  return response.data;
};

export const getUserById = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const getUserByPhone = async (phoneNumber) => {
  const response = await api.get(`/users/phone-number/${phoneNumber}`);
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await api.patch(`/users/${id}`, userData);
  return response.data;
};

// ================= Collections (reference-style) =================
export const createCollection = async (data) => {
  const response = await api.post("/collections", data);
  return response.data;
};

export const getCollectionsByFestival = async (festivalId) => {
  const response = await api.get(`/collections/festival/${festivalId}`);
  return response.data;
};

export const deleteCollection = async (id) => {
  const response = await api.delete(`/collections/${id}`);
  return response.data;
};

// Legacy payment-detail helpers (kept for compatibility)
export const AddPayment = async (paymentData) => {
  const response = await api.post("/payment-detail/add-payment", paymentData);
  return response.data;
};

export const getFestivalPayments = async (festivalId) => {
  const response = await api.get(`/payment-detail/festival/${festivalId}`);
  return response.data;
};

export const getFestivalTotal = async (festivalId) => {
  const response = await api.get(`/payment-detail/festival/${festivalId}/total`);
  return response.data;
};

export const updatePayment = async (data) => {
  const response = await api.patch("/payment-detail/update-payment", data);
  return response.data;
};

export const deletePayment = async (data) => {
  const response = await api.delete("/payment-detail/delete-payment", { data });
  return response.data;
};

// ================= Expenses =================
export const createExpense = async (data) => {
  const response = await api.post("/expenses", data);
  return response.data;
};

export const getExpenseCategories = async () => {
  const response = await api.get("/expenses/categories/all");
  return response.data;
};

export const getFestivalExpenses = async (festivalId) => {
  const response = await api.get(`/expenses/festival/${festivalId}`);
  return response.data;
};

export const updateExpense = async (id, data) => {
  const response = await api.patch(`/expenses/${id}`, data);
  return response.data;
};

export const deleteExpense = async (id) => {
  const response = await api.delete(`/expenses/${id}`);
  return response.data;
};

// ================= Feedback =================
export const submitFeedback = async (data) => {
  const response = await api.post("/feedback", data);
  return response.data;
};

export const getFeedback = async () => {
  const response = await api.get("/feedback");
  return response.data;
};

export const deleteFeedback = async (id) => {
  const response = await api.delete(`/feedback/${id}`);
  return response.data;
};

export { unwrapList };
