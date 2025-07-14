import { Withdrawal } from '@/app/model/withdraw_model'
import { db } from '@/firebase/clientApp'
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore'
import { performTransfer, TransferRequest } from './transfer'

// Get all pending withdrawals
export async function getPendingWithdrawals(): Promise<Withdrawal[]> {
    const q = query(
        collection(db, 'Withdrawals'),
        where('status', '==', 'pending')
    )
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Withdrawal))
}

// Get all completed withdrawals
export async function getCompletedWithdrawals(): Promise<Withdrawal[]> {
    const q = query(
        collection(db, 'Withdrawals'),
        where('status', '==', 'completed')
    )
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Withdrawal))
}


// Get all rejected withdrawals
export async function getRejectedWithdrawals(): Promise<Withdrawal[]> {
    const q = query(
        collection(db, 'Withdrawals'),
        where('status', '==', 'rejected')
    )
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Withdrawal))
}

export async function rejectWithdrawal(
    withdrawalId: string,
    adminId: string,
    reason: string
): Promise<void> {
    const withdrawalRef = doc(db, 'Withdrawals', withdrawalId)
    await updateDoc(withdrawalRef, {
        status: 'rejected',
        rejectedAt: serverTimestamp(),
        rejectedBy: adminId,
        rejectionReason: reason
    })

}

// Get withdrawal by ID
export async function getWithdrawalById(id: string): Promise<Withdrawal | null> {
    const docRef = doc(db, 'Withdrawals', id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
        return null
    }

    return {
        id: docSnap.id,
        ...docSnap.data()
    } as Withdrawal
}

// Approve a withdrawal
export async function approveWithdrawal(withdrawalId: string): Promise<void> {
    // Update withdrawal status
    try {
        // Fetch withdrawal details
        const withdrawal = await getWithdrawalById(withdrawalId);
        if (!withdrawal) {
            throw new Error(`Withdrawal with ID ${withdrawalId} not found`);
        }

        if (withdrawal.status !== 'pending') {
            throw new Error(`Withdrawal with ID ${withdrawalId} is not in pending status`);
        }

        performTransfer((withdrawal.amount * 100).toString(), withdrawal.recipientCode, withdrawal.id);

        const withdrawalRef = doc(db, 'Withdrawals', withdrawalId)
        await updateDoc(withdrawalRef, {
            status: 'completed',
            approvedAt: serverTimestamp(),
            approvedBy: 'admin'
        })
    }
    catch (err) {
        throw new Error(`Failed to approve withdrawal`);
    }
}

// Get user details for a withdrawal
export async function getWithdrawalUserDetails(withdrawal: Withdrawal) {
    try {
        // Validate withdrawal.type
        if (!['pharmacy', 'doctor'].includes(withdrawal.type)) {
            throw new Error(`Invalid withdrawal type: ${withdrawal.type}`);
        }

        const collectionName = withdrawal.type === 'pharmacy' ? 'Pharmacies' : 'Users';
        const userDoc = await getDoc(doc(db, collectionName, withdrawal.userId));

        if (userDoc.exists()) {
            return {
                name: userDoc.data().name || userDoc.data().pharmacyName,
                email: userDoc.data().email,
                phone: userDoc.data().phone,
            };
        }
        return null;
    } catch (error) {
        console.error(`Error fetching ${withdrawal.type} details:`, error);
        return null;
    }
}