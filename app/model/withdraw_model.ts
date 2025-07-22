import { Timestamp } from 'firebase/firestore'

export interface Withdrawal {
    id: string
    date: Timestamp
    amount: number
    bankName: string
    bankCode: string
    recipientCode: string
    reference: string
    accountNumber: string
    accountName: string
    type: 'pharmacy' | 'doctor'
    status: 'pending' | 'completed' | 'rejected'
    userId: string
    approvedBy?: string
    approvedAt?: Timestamp
    rejectedBy?: string
    rejectedAt?: Timestamp
    rejectionReason?: string
    createdAt?: Timestamp
    user?: {
        name: string
        email: string
        phone: string
        address: string
    }
}