import { Timestamp } from "firebase/firestore";

export interface UserModel {
    balance: number;
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    phoneNumber?: string;
    bloodGroup?: string;
    dob?: Timestamp;
    gender?: string;
    genotype?: string;
    height?: string;
    weight?: string;
    maritalStatus?: string;
    surgicalHistory?: string;
    lastSeen?: Timestamp;
    token?: string;
    address?: string;
    country?: string;
    createdAt?: Timestamp;
    role?: string;
    // for doctors
    isAvailable?: boolean;
    accountStatus?: string;
    amount?: number;
    bio?: string;
    certificate: string; //this is a link to the uploaded certificate
    experience: number;
    photoUrl?: string;
    specialization?: string;
    workAddress?: string;
    yearHousemanship?: string;
    referralBalance: number,
    referralProgramApplied: boolean,
    referralEnabled: boolean,
    referralProgramAppliedAt: Timestamp,
    bankName: string,
    accountNumber: string,
    accountName: string
}