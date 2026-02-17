import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CoordinatesDTO } from '../types/coordinates';
import type { WebSocketEvent } from '../types/common';
import { coordinatesApi } from '../api/coordinatesApi';

interface CoordinatesState {
    items: CoordinatesDTO[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error?: string;
}

const initialState: CoordinatesState = {
    items: [],
    status: 'idle',
};


export const fetchCoordinates = createAsyncThunk(
    'coordinates/fetchAll',
    async () => {
        return coordinatesApi.getAll();
    }
);

export const createCoordinates = createAsyncThunk(
    'coordinates/create',
    async (dto: CoordinatesDTO) => {
        return coordinatesApi.create(dto);
    }
);

export const updateCoordinates = createAsyncThunk(
    'coordinates/update',
    async ({ id, dto }: { id: number; dto: CoordinatesDTO }) => {
        return coordinatesApi.update(id, dto);
    }
);

export const deleteCoordinates = createAsyncThunk(
    'coordinates/delete',
    async (id: number) => {
        await coordinatesApi.delete(id);
        return id;
    }
);


const coordinatesSlice = createSlice({
    name: 'coordinates',
    initialState,
    reducers: {
        applyWebSocketEvent(
            state,
            action: PayloadAction<WebSocketEvent<CoordinatesDTO>>
        ) {
            const { action: act, data } = action.payload;
            const coord = data;
            const idx = state.items.findIndex((c) => c.id === coord.id);

            if (act === 'create' || act === 'update') {
                if (idx !== -1) {
                    state.items[idx] = coord;
                } else {
                    state.items.unshift(coord);
                }
            } else if (act === 'delete') {
                if (idx !== -1) {
                    state.items.splice(idx, 1);
                }
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCoordinates.pending, (state) => {
                state.status = 'loading';
                state.error = undefined;
            })
            .addCase(fetchCoordinates.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchCoordinates.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(createCoordinates.fulfilled, (state, action) => {
                const item = action.payload;
                const idx = state.items.findIndex((c) => c.id === item.id);
                if (idx !== -1) state.items[idx] = item;
                else state.items.unshift(item);
            })
            .addCase(updateCoordinates.fulfilled, (state, action) => {
                const item = action.payload;
                const idx = state.items.findIndex((c) => c.id === item.id);
                if (idx !== -1) state.items[idx] = item;
            })
            .addCase(deleteCoordinates.fulfilled, (state, action) => {
                const id = action.payload;
                state.items = state.items.filter((c) => c.id !== id);
            });
    },
});

export const { applyWebSocketEvent } = coordinatesSlice.actions;
export default coordinatesSlice.reducer;
