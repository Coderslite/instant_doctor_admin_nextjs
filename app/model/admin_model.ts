import { Timestamp } from "firebase/firestore";
import { AdminRole } from "@/utils/roles";

// Administrator document as shown in the panel (password fields never included)
export interface AdminModel {
    id: string;
    name: string;
    email: string;
    role: AdminRole;
    createdAt?: Timestamp;
}
