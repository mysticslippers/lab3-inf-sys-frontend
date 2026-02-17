import { http } from './httpClient';
import type { LocationDTO } from '../types/location';

export const locationsApi = {
    getAll: async () => {
        const response = await http.get<LocationDTO[]>('/locations');
        return response.data;
    },

    getById: async (id: number) => {
        const response = await http.get<LocationDTO>(`/locations/${id}`);
        return response.data;
    },

    create: async (dto: LocationDTO) => {
        const response = await http.post<LocationDTO>('/locations', dto);
        return response.data;
    },

    update: async (id: number, dto: LocationDTO) => {
        const response = await http.put<LocationDTO>(`/locations/${id}`, dto);
        return response.data;
    },

    delete: async (id: number) => {
        await http.delete(`/locations/${id}`);
    },
};
