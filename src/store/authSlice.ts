import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { http } from '../api/httpClient';
import { getApiErrorMessage } from '../utils/errorUtils';

const TOKEN_KEY = 'auth_basic_token';
const USERNAME_KEY = 'auth_username';
const ROLE_KEY = 'auth_role';

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'error';
export type UserRole = 'USER' | 'ADMIN';

interface UserDTO {
    id: number;
    username: string;
    role: UserRole;
}

interface AuthState {
    username: string | null;
    role: UserRole | null;
    token: string | null;
    status: AuthStatus;
    error?: string;
}

let initialToken: string | null = null;
let initialUsername: string | null = null;
let initialRole: UserRole | null = null;

if (typeof window !== 'undefined') {
    initialToken = localStorage.getItem(TOKEN_KEY);
    initialUsername = localStorage.getItem(USERNAME_KEY);
    const storedRole = localStorage.getItem(ROLE_KEY) as UserRole | null;
    initialRole = storedRole ?? null;

    if (initialToken) {
        http.defaults.headers.common['Authorization'] = `Basic ${initialToken}`;
    }
}

const initialState: AuthState = {
    username: initialUsername,
    role: initialRole,
    token: initialToken,
    status: initialToken ? 'authenticated' : 'idle',
    error: undefined,
};

export const login = createAsyncThunk<
    { username: string; role: UserRole; token: string },
    { username: string; password: string },
    { rejectValue: string }
>('auth/login', async ({ username, password }, { rejectWithValue }) => {
    const token = btoa(`${username}:${password}`);

    try {
        const response = await http.get<UserDTO>('/me', {
            headers: {
                Authorization: `Basic ${token}`,
            },
        });

        const user = response.data;

        return {
            username: user.username,
            role: user.role,
            token,
        };
    } catch (err: any) {
        const msg = getApiErrorMessage(err, 'Неверные имя пользователя или пароль');
        return rejectWithValue(msg);
    }
});

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout(state) {
            state.username = null;
            state.role = null;
            state.token = null;
            state.status = 'idle';
            state.error = undefined;

            if (typeof window !== 'undefined') {
                localStorage.removeItem(TOKEN_KEY);
                localStorage.removeItem(USERNAME_KEY);
                localStorage.removeItem(ROLE_KEY);
            }

            delete http.defaults.headers.common['Authorization'];
        },
        clearAuthError(state) {
            state.error = undefined;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.status = 'loading';
                state.error = undefined;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.status = 'authenticated';
                state.username = action.payload.username;
                state.role = action.payload.role;
                state.token = action.payload.token;
                state.error = undefined;

                if (typeof window !== 'undefined') {
                    localStorage.setItem(TOKEN_KEY, action.payload.token);
                    localStorage.setItem(USERNAME_KEY, action.payload.username);
                    localStorage.setItem(ROLE_KEY, action.payload.role);
                }

                http.defaults.headers.common['Authorization'] =
                    `Basic ${action.payload.token}`;
            })
            .addCase(login.rejected, (state, action) => {
                state.status = 'error';
                state.error =
                    action.payload ?? 'Не удалось войти. Проверьте логин и пароль.';
                state.username = null;
                state.role = null;
                state.token = null;

                delete http.defaults.headers.common['Authorization'];

                if (typeof window !== 'undefined') {
                    localStorage.removeItem(TOKEN_KEY);
                    localStorage.removeItem(USERNAME_KEY);
                    localStorage.removeItem(ROLE_KEY);
                }
            });
    },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
