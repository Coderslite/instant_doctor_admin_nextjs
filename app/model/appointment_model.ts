import { Timestamp } from "firebase/firestore";

export interface AppointmentModel {
    id: string;
    userId: string;
    doctorId: string;
    complain: string;
    price: number;
    startTime: Timestamp;
    endTime: Timestamp;
    isPaid: boolean;
    createdAt: Timestamp;
    status: string;
}
