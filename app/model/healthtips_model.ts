import { Timestamp } from "firebase/firestore";

export interface HealthtipsModel {
    id: string,
    title: string,
    description: string,
    categoryId: string,
    image: string,
    type: string,
    views: number,
    createdAt: Timestamp,
}

export interface HealthCategoryModel {
    id: string,
    name: string,
    image: string,
}