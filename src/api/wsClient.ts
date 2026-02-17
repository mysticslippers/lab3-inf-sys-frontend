import { Client, type IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { WebSocketEvent } from '../types/common';
import type { RouteDTO } from '../types/route';
import type { LocationDTO } from '../types/location';
import type { CoordinatesDTO } from '../types/coordinates';

type RoutesCallback = (event: WebSocketEvent<RouteDTO>) => void;
type LocationsCallback = (event: WebSocketEvent<LocationDTO>) => void;
type CoordinatesCallback = (event: WebSocketEvent<CoordinatesDTO>) => void;

class WebSocketService {
    private client: Client | null = null;

    private routesCallbacks: RoutesCallback[] = [];
    private locationsCallbacks: LocationsCallback[] = [];
    private coordinatesCallbacks: CoordinatesCallback[] = [];

    connect() {
        if (this.client) return;

        const socketFactory = () => new SockJS('/ws');

        this.client = new Client({
            webSocketFactory: socketFactory as any,
            reconnectDelay: 5000,
            onConnect: () => {
                this.subscribeTopics();
            },
            onStompError: (frame) => {
                console.error('STOMP error', frame.headers['message'], frame.body);
            },
        });

        this.client.activate();
    }

    private subscribeTopics() {
        if (!this.client) return;

        this.client.subscribe('/topic/routes', (message: IMessage) => {
            const body = JSON.parse(message.body) as WebSocketEvent<RouteDTO>;
            this.routesCallbacks.forEach((cb) => cb(body));
        });

        this.client.subscribe('/topic/locations', (message: IMessage) => {
            const body = JSON.parse(message.body) as WebSocketEvent<LocationDTO>;
            this.locationsCallbacks.forEach((cb) => cb(body));
        });

        this.client.subscribe('/topic/coordinates', (message: IMessage) => {
            const body = JSON.parse(message.body) as WebSocketEvent<CoordinatesDTO>;
            this.coordinatesCallbacks.forEach((cb) => cb(body));
        });
    }

    onRoutesEvent(cb: RoutesCallback) {
        this.routesCallbacks.push(cb);
    }

    onLocationsEvent(cb: LocationsCallback) {
        this.locationsCallbacks.push(cb);
    }

    onCoordinatesEvent(cb: CoordinatesCallback) {
        this.coordinatesCallbacks.push(cb);
    }
}

export const wsService = new WebSocketService();
