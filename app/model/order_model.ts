import { Timestamp } from "firebase/firestore";

export interface OrderModel {
    id: string;
    trackingId:string;
    name: string;
    totalAmount: number;
    createdAt: Timestamp;
    remaining: string;
    pharmacyId: string;
    userId: string;
    items: ItemModel[];
    status: 'pending' | 'confirmed' | 'delivering' | 'completed';
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
