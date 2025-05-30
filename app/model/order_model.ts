import { Timestamp } from "firebase/firestore";

export interface OrderModel {
    id: string;
    trackingId:string;
    name: string;
    totalAmount: number;
    createdAt: Timestamp;
    remaining: string;
    pharmacyId: string;
    pharmacyName?:string;
    userId: string;
    items: ItemModel[];
    status: 'pending' | 'confirmed' | 'delivering' | 'completed' | 'cancelled';
    deliveryFee?: number;
    address: string;
}


export interface ItemModel {
    amount: number;
    id: string;
    images: string[];
    name: string;
    pharmacyId: string;
    quantity: number;

}
