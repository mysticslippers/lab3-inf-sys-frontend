import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { LocationDTO } from '../types/location';
import type { WebSocketEvent } from '../types/common';
import { locationsApi } from '../api/locationsApi';

interface LocationsState {
    items: LocationDTO[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error?: string;
}

const initialState: LocationsState = {
    items: [],
    status: 'idle',
};


export const fetchLocations = createAsyncThunk(
    'locations/fetchAll',
    async () => {
        return locationsApi.getAll();
    }
);

export const createLocation = createAsyncThunk(
    'locations/create',
    async (dto: LocationDTO) => {
        return locationsApi.create(dto);
    }
);

export const updateLocation = createAsyncThunk(
    'locations/update',
    async ({ id, dto }: { id: number; dto: LocationDTO }) => {
        return locationsApi.update(id, dto);
    }
);

export const deleteLocation = createAsyncThunk(
    'locations/delete',
    async (id: number) => {
        await locationsApi.delete(id);
        return id;
    }
);


const locationsSlice = createSlice({
    name: 'locations',
    initialState,
    reducers: {
        applyWebSocketEvent(
            state,
            action: PayloadAction<WebSocketEvent<LocationDTO>>
        ) {
            const { action: act, data } = action.payload;
            const loc = data;
            const idx = state.items.findIndex((l) => l.id === loc.id);

            if (act === 'create' || act === 'update') {
                if (idx !== -1) {
                    state.items[idx] = loc;
                } else {
                    state.items.unshift(loc);
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
            .addCase(fetchLocations.pending, (state) => {
                state.status = 'loading';
                state.error = undefined;
            })
            .addCase(fetchLocations.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchLocations.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(createLocation.fulfilled, (state, action) => {
                const item = action.payload;
                const idx = state.items.findIndex((l) => l.id === item.id);
                if (idx !== -1) state.items[idx] = item;
                else state.items.unshift(item);
            })
            .addCase(updateLocation.fulfilled, (state, action) => {
                const item = action.payload;
                const idx = state.items.findIndex((l) => l.id === item.id);
                if (idx !== -1) state.items[idx] = item;
            })
            .addCase(deleteLocation.fulfilled, (state, action) => {
                const id = action.payload;
                state.items = state.items.filter((l) => l.id !== id);
            });
    },
});

export const { applyWebSocketEvent } = locationsSlice.actions;
export default locationsSlice.reducer;
