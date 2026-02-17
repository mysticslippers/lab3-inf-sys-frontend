import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { UserDTO, UserRole } from '../types/user';
import { usersApi } from '../api/usersApi';
import { getApiErrorMessage } from '../utils/errorUtils';

interface UsersState {
    items: UserDTO[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    changingId: number | null;
    error?: string;
}

const initialState: UsersState = {
    items: [],
    status: 'idle',
    changingId: null,
    error: undefined,
};

export const fetchUsers = createAsyncThunk<
    UserDTO[],
    void,
    { rejectValue: string }
>('users/fetchAll', async (_, { rejectWithValue }) => {
    try {
        return await usersApi.getAll();
    } catch (err: any) {
        const msg = getApiErrorMessage(err, 'Не удалось загрузить список пользователей');
        return rejectWithValue(msg);
    }
});

export const updateUserRole = createAsyncThunk<
    UserDTO,
    { id: number; role: UserRole },
    { rejectValue: string }
>('users/updateRole', async ({ id, role }, { rejectWithValue }) => {
    try {
        return await usersApi.updateRole(id, role);
    } catch (err: any) {
        const msg = getApiErrorMessage(err, 'Не удалось изменить роль пользователя');
        return rejectWithValue(msg);
    }
});

const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        clearUsersError(state) {
            state.error = undefined;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.status = 'loading';
                state.error = undefined;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.status = 'failed';
                state.error =
                    action.payload ?? action.error.message ?? 'Не удалось загрузить пользователей';
            })
            .addCase(updateUserRole.pending, (state, action) => {
                state.changingId = action.meta.arg.id;
                state.error = undefined;
            })
            .addCase(updateUserRole.fulfilled, (state, action) => {
                state.changingId = null;
                const updated = action.payload;
                const idx = state.items.findIndex((u) => u.id === updated.id);
                if (idx !== -1) {
                    state.items[idx] = updated;
                }
            })
            .addCase(updateUserRole.rejected, (state, action) => {
                state.changingId = null;
                state.error =
                    action.payload ?? action.error.message ?? 'Не удалось изменить роль пользователя';
            });
    },
});

export const { clearUsersError } = usersSlice.actions;
export default usersSlice.reducer;
