import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RouteDTO } from '../types/route';
import type { PageResponse, WebSocketEvent } from '../types/common';
import { routesApi, type RoutesPageRequest } from '../api/routesApi';

export interface RoutesState {
    page: PageResponse<RouteDTO> | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error?: string;
    pageRequest: Required<Pick<RoutesPageRequest, 'page' | 'size'>> & {
        sort?: string;
    };
}

const initialState: RoutesState = {
    page: null,
    status: 'idle',
    error: undefined,
    pageRequest: {
        page: 0,
        size: 10,
        sort: undefined,
    },
};


export const fetchRoutesPage = createAsyncThunk(
    'routes/fetchPage',
    async (_, { getState }) => {
        const state = getState() as { routes: RoutesState };
        const { pageRequest } = state.routes;
        return routesApi.getPage(pageRequest);
    }
);

export const createRoute = createAsyncThunk(
    'routes/create',
    async (dto: RouteDTO) => {
        return routesApi.create(dto);
    }
);

export const updateRoute = createAsyncThunk(
    'routes/update',
    async ({ id, dto }: { id: number; dto: RouteDTO }) => {
        return routesApi.update(id, dto);
    }
);

export const deleteRoute = createAsyncThunk(
    'routes/delete',
    async (id: number) => {
        await routesApi.delete(id);
        return id;
    }
);


const routesSlice = createSlice({
    name: 'routes',
    initialState,
    reducers: {
        setPageRequest(state, action: PayloadAction<RoutesState['pageRequest']>) {
            state.pageRequest = action.payload;
        },

        applyWebSocketEvent(
            state,
            action: PayloadAction<WebSocketEvent<RouteDTO>>
        ) {
            const event = action.payload;
            const route = event.data;

            if (!state.page) return;

            const idx = state.page.content.findIndex((r) => r.id === route.id);

            if (event.action === 'create') {
                if (idx === -1) {
                    state.page.content.unshift(route);
                    state.page.totalElements += 1;
                } else {
                    state.page.content[idx] = route;
                }
            } else if (event.action === 'update') {
                if (idx !== -1) {
                    state.page.content[idx] = route;
                }
            } else if (event.action === 'delete') {
                if (idx !== -1) {
                    state.page.content.splice(idx, 1);
                    state.page.totalElements = Math.max(
                        0,
                        state.page.totalElements - 1
                    );
                }
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchRoutesPage.pending, (state) => {
                state.status = 'loading';
                state.error = undefined;
            })
            .addCase(fetchRoutesPage.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.page = action.payload;
            })
            .addCase(fetchRoutesPage.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })

            .addCase(createRoute.fulfilled, (state, action) => {
                if (!state.page) return;
                const route = action.payload;
                const idx = state.page.content.findIndex((r) => r.id === route.id);
                if (idx !== -1) {
                    state.page.content[idx] = route;
                } else {
                    state.page.content.unshift(route);
                    state.page.totalElements += 1;
                }
            })
            .addCase(updateRoute.fulfilled, (state, action) => {
                if (!state.page) return;
                const route = action.payload;
                const idx = state.page.content.findIndex((r) => r.id === route.id);
                if (idx !== -1) {
                    state.page.content[idx] = route;
                }
            })
            .addCase(deleteRoute.fulfilled, (state, action) => {
                if (!state.page) return;
                const id = action.payload;
                const idx = state.page.content.findIndex((r) => r.id === id);
                if (idx !== -1) {
                    state.page.content.splice(idx, 1);
                    state.page.totalElements = Math.max(
                        0,
                        state.page.totalElements - 1
                    );
                }
            });
    },
});

export const { setPageRequest, applyWebSocketEvent } = routesSlice.actions;
export default routesSlice.reducer;
