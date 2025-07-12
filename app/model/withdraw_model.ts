import { Timestamp } from 'firebase/firestore'

export interface Withdrawal {
    id: string;
    date: Timestamp;
    description: string;
    amount: number;
    bankName: string;
    accountNumber: string;
    accountName: string;
    type: 'pharmacy' | 'doctor';
    status: 'pending' | 'completed' | 'rejected';
    userId: string;
    approvedBy?: string;
    approvedAt?: Timestamp;
    rejectedBy?: string;
    rejectedAt?: Timestamp;
    rejectionReason?: string;
    user?: {
        name: string;
        email: string;
        phone: string;
    };
}