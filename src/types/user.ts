export type UserRole = 'USER' | 'ADMIN';

export interface UserDTO {
    id: number;
    username: string;
    role: UserRole;
}
