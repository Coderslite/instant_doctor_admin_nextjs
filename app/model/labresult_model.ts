import { Timestamp } from "firebase/firestore";

export interface LabresultModel{
    id:string,
    userId:string,
    files:string[],
    resultUrl:string,
    status:string,
    createdAt:Timestamp,
}