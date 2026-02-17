import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ImportOperationDTO } from '../types/import';
import { importsApi } from '../api/importsApi';

export type ImportsScope = 'my' | 'all';

interface ImportsState {
    items: ImportOperationDTO[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error?: string;
    scope: ImportsScope;
}

const initialState: ImportsState = {
    items: [],
    status: 'idle',
    scope: 'my',
};

export const fetchMyImports = createAsyncThunk(
    'imports/fetchMy',
    async () => {
        return importsApi.getMyOperations();
    }
);

export const fetchAllImports = createAsyncThunk(
    'imports/fetchAll',
    async () => {
        return importsApi.getAllOperations();
    }
);

const importsSlice = createSlice({
    name: 'imports',
    initialState,
    reducers: {
        setScope(state, action: PayloadAction<ImportsScope>) {
            state.scope = action.payload;
        },
        clearError(state) {
            state.error = undefined;
        },
        prependOperation(state, action: PayloadAction<ImportOperationDTO>) {
            state.items.unshift(action.payload);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMyImports.pending, (state) => {
                state.status = 'loading';
                state.error = undefined;
            })
            .addCase(fetchMyImports.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
                state.scope = 'my';
            })
            .addCase(fetchMyImports.rejected, (state, action) => {
                state.status = 'failed';
                state.error =
                    action.error.message ?? 'Не удалось загрузить операции импорта';
            })
            .addCase(fetchAllImports.pending, (state) => {
                state.status = 'loading';
                state.error = undefined;
            })
            .addCase(fetchAllImports.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
                state.scope = 'all';
            })
            .addCase(fetchAllImports.rejected, (state, action) => {
                state.status = 'failed';
                state.error =
                    action.error.message ??
                    'Не удалось загрузить список всех операций импорта';
            });
    },
});

export const { setScope, clearError, prependOperation } = importsSlice.actions;
export default importsSlice.reducer;
