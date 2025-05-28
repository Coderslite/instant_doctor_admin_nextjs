// src/app/model/pharmacy_model.ts
import { GeoPoint, Timestamp } from "firebase/firestore";

export interface PharmacyModel {
    id: string;
    name: string;
    address: string;
    location: GeoPoint;
    deliveryFee: string;
    email: string;
    phoneNumber: string;
    image: string;
    password: string; // Added password field
    createdAt: Timestamp;
    status: string;
}

export interface NewPharmacyData {
    name: string;
    address: string;
    location: {
        latitude: number;
        longitude: number;
    };
    deliveryFee: string;
    email: string;
    phoneNumber: string;
    imageFile?: File;
    password: string; // Added password field
    status:string;
}