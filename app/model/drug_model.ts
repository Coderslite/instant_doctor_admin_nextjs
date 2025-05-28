import { Timestamp } from "firebase/firestore";

export interface DrugModel {
    id: string;
    name: string;
    images: string[];
    remaining: number;
    pharamcyId: string;
    description: string;
    amount: number;
    createdAt: Timestamp;
}

export interface DrugCategory {
    id: string;
    name: string;
}

export interface NewStockData {
    name: string;
    images: string[]; // Changed from image to images array
    amount: number;
    remaining: number;
    createdAt: any;
    pharmacyId: string;
    description: string;
    discount: number;
    category: string;
    purchasePrice: number;
    quantity: number;
}

// app/model/stock_model.ts
export interface StockItem {
    id: string;
    name: string;
    images: string[];
    amount: number;
    remaining: number;
    description: string;
    discount: number;
    category: string;
    purchasePrice: number;
    quantity: number;
    createdAt: { seconds: number; nanoseconds: number };
    pharmacyId: string;
}

export interface UpdateStockData {
    name?: string;
    amount?: number;
    description?: string;
    discount?: number;
    category?: string;
    purchasePrice?: number;
  }