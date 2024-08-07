export interface User {
    id: string;
    firstName: string;
    lastName: string;
    photoUrl: string;
    role: 'BUYER' | 'SELLER';
}