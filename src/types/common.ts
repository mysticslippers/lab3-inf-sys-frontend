export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

export type WebSocketAction = 'create' | 'update' | 'delete';

export interface WebSocketEvent<T = unknown> {
    entity: 'route' | 'coordinates' | 'location';
    action: WebSocketAction;
    data: T;
}
