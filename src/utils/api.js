import axios from "axios";

const API_URL = "http://localhost:3000";

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export const createFestival = async (festivalData) => {
    try {
        const response = await api.post('/festival/create-festival', festivalData);
        return response.data;
    } catch (error) {
        throw error;
    }
};
export const getFestivals = async () => {
    try {
        const response = await api.post('/festival/get-all-festivals');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createUser = async (userData) => {
    try {
        const response = await api.post('/users/create-user', userData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const AddPayment = async (paymentData) => {
    try {
        const response = await api.post('/payment-detail/add-payment', paymentData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

