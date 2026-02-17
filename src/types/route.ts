import type { CoordinatesDTO } from './coordinates';
import type { LocationDTO } from './location';

export interface RouteDTO {
    id?: number;
    name: string;
    coordinates: CoordinatesDTO;
    from: LocationDTO;
    to: LocationDTO;
    distance?: number | null;
    rating: number;
    creationDate?: string;
}
