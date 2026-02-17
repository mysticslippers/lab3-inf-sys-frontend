import type { AxiosError } from 'axios';

type ApiErrorItem = {
    field?: string;
    message?: string;
    [key: string]: unknown;
};

type ApiErrorResponse = {
    timestamp?: string;
    status?: number;
    error?: string;
    message?: string;
    errors?: ApiErrorItem[];
    [key: string]: unknown;
};

export function getApiErrorMessage(
    error: unknown,
    fallback: string
): string {
    const err = error as AxiosError<ApiErrorResponse> | undefined;

    if (!err || !('isAxiosError' in err) || !err.isAxiosError) {
        return fallback;
    }

    const status = err.response?.status;
    const data = err.response?.data;

    if (typeof data === 'string') {
        return data || fallback;
    }

    if (data && typeof data === 'object') {
        const api = data as ApiErrorResponse;

        let validationMessage: string | null = null;

        if (Array.isArray(api.errors) && api.errors.length > 0) {
            const parts: string[] = [];

            for (const e of api.errors) {
                if (!e || typeof e !== 'object') continue;

                const msg = typeof e.message === 'string' ? e.message.trim() : '';
                const field =
                    typeof e.field === 'string' ? e.field.trim() : '';

                if (msg && field) {
                    parts.push(`${field}: ${msg}`);
                } else if (msg) {
                    parts.push(msg);
                }
            }

            if (parts.length > 0) {
                validationMessage = parts.slice(0, 3).join('; ');
            }
        }

        if (validationMessage) {
            return validationMessage;
        }

        if (api.message && api.message.trim()) {
            return api.message.trim();
        }
    }


    if (status === 400) {
        return 'Некорректные данные запроса. Проверьте введённые значения.';
    }

    if (status === 404) {
        return 'Объект не найден или уже был удалён.';
    }

    if (status === 409) {
        return 'Конфликт данных. Объект уже существует или нарушены ограничения.';
    }

    if (status && status >= 500) {
        return 'На сервере произошла ошибка. Попробуйте позже.';
    }

    if (err.message) {
        return err.message;
    }

    return fallback;
}
