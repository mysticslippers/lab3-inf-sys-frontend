// src/api/httpClient.ts
import axios from 'axios';

const AUTH_TOKEN_KEY = 'auth_basic_token';

export const http = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

if (typeof window !== 'undefined') {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
        http.defaults.headers.common['Authorization'] = `Basic ${token}`;
    }
}

http.interceptors.response.use(
    (response) => response,
    (error) => {
        return Promise.reject(error);
    }
);
