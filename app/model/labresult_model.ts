import { Timestamp } from "firebase/firestore";

// Each uploaded file is stored as { fileUrl, fileType } in Firestore
export interface LabresultFile{
    fileUrl:string,
    fileType:string,
}

export interface LabresultModel{
    id:string,
    userId:string,
    files:LabresultFile[],
    resultUrl:string,
    status:string,
    createdAt:Timestamp,
}