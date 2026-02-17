import { http } from './httpClient';
import type { UserDTO, UserRole } from '../types/user';

export const usersApi = {
    getAll: async () => {
        const response = await http.get<UserDTO[]>('/users'); // /api/users
        return response.data;
    },

    updateRole: async (id: number, role: UserRole) => {
        const response = await http.patch<UserDTO>(`/users/${id}/role`, {
            role,
        });
        return response.data;
    },
};
