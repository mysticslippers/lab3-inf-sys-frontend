import { http } from './httpClient';
import type { RouteDTO } from '../types/route';
import type { PageResponse } from '../types/common';

export interface RoutesPageRequest {
    page?: number;
    size?: number;
    sort?: string;
}

export const routesApi = {
    getPage: async (params: RoutesPageRequest) => {
        const { page, size, sort } = params;
        const query: Record<string, unknown> = {};

        if (typeof page === 'number') query.page = page;
        if (typeof size === 'number') query.size = size;
        if (sort && sort.trim()) query.sort = sort.trim();

        const response = await http.get<PageResponse<RouteDTO>>('/routes', {
            params: query,
        });
        return response.data;
    },

    getById: async (id: number) => {
        const response = await http.get<RouteDTO>(`/routes/${id}`);
        return response.data;
    },

    create: async (dto: RouteDTO) => {
        const response = await http.post<RouteDTO>('/routes', dto);
        return response.data;
    },

    update: async (id: number, dto: RouteDTO) => {
        const response = await http.put<RouteDTO>(`/routes/${id}`, dto);
        return response.data;
    },

    delete: async (id: number) => {
        await http.delete(`/routes/${id}`);
    },


    getMinDistanceRoute: async () => {
        const response = await http.get<RouteDTO>('/routes/min-distance');
        return response.data;
    },

    getGroupedByRating: async () => {
        const response = await http.get<Record<string, number>>(
            '/routes/group-by-rating'
        );
        return response.data;
    },

    getUniqueRatings: async () => {
        const response = await http.get<number[]>('/routes/unique-ratings');
        return response.data;
    },

    findBetween: async (
        fromId: number,
        toId: number,
        sortBy: 'id' | 'distance' | 'rating' | 'name'
    ) => {
        const response = await http.get<RouteDTO[]>('/routes/between', {
            params: { fromId, toId, sortBy },
        });
        return response.data;
    },

    addBetween: async (fromId: number, toId: number, dto: RouteDTO) => {
        const response = await http.post<RouteDTO>('/routes/between', dto, {
            params: { fromId, toId },
        });
        return response.data;
    },
};
