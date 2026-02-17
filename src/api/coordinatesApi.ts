import { http } from './httpClient';
import type { CoordinatesDTO } from '../types/coordinates';

export const coordinatesApi = {
    getAll: async () => {
        const response = await http.get<CoordinatesDTO[]>('/coordinates');
        return response.data;
    },

    getById: async (id: number) => {
        const response = await http.get<CoordinatesDTO>(`/coordinates/${id}`);
        return response.data;
    },

    create: async (dto: CoordinatesDTO) => {
        const response = await http.post<CoordinatesDTO>('/coordinates', dto);
        return response.data;
    },

    update: async (id: number, dto: CoordinatesDTO) => {
        const response = await http.put<CoordinatesDTO>(`/coordinates/${id}`, dto);
        return response.data;
    },

    delete: async (id: number) => {
        await http.delete(`/coordinates/${id}`);
    },
};
