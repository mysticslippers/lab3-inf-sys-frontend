import { http } from './httpClient';
import type { ImportOperationDTO } from '../types/import';

export const importsApi = {
    importRoutesFile: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await http.post<ImportOperationDTO>(
            '/import/routes',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        return response.data;
    },

    getMyOperations: async () => {
        const response = await http.get<ImportOperationDTO[]>(
            '/import/operations/my'
        );
        return response.data;
    },

    getAllOperations: async () => {
        const response = await http.get<ImportOperationDTO[]>(
            '/import/operations/all'
        );
        return response.data;
    },
};
