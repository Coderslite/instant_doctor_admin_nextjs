export interface UserModel {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    phoneNumber?: string;
    photoUrl?: string;
    token?: string;
    address?: string;
}