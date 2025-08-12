import { GeoPoint, Timestamp } from "firebase/firestore";

export interface WaitlistModel {
    id: string,
    address: string,
    createdAt: Timestamp,
    location: GeoPoint,
    userId: string,
    status: string,
}