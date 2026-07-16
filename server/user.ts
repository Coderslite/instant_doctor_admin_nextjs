import { UserModel } from "@/app/model/user_model";
import { db } from "@/firebase/clientApp";
import { collection, doc, getDoc, updateDoc, DocumentData, query, getDocs, Timestamp } from "firebase/firestore";

const userCol = collection(db, 'Users');

async function getUserById(id: string): Promise<UserModel | null> {
    const userRef = doc(userCol, id);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        console.log("exist")
        const userData = userSnap.data();

        // Convert DocumentData to UserModel
        const user: UserModel = {
            id: userSnap.id,
            firstname: userData.firstname,
            lastname: userData.lastname,
            email: userData.email,
            phoneNumber: userData.phoneNumber,
            photoUrl: userData.photoUrl,
            token: userData.token,
            certificate: userData.certificate,
            experience: userData.experience,
            isAvailable: userData.isAvailable,
            accountStatus: userData.accountStatus,
            amount: userData.amount,
            bio: userData.bio,
            specialization: userData.specialization,
            workAddress: userData.workAddress,
            yearHousemanship: userData.yearHousemanship,
            balance: userData.balance,
            referralBalance:userData.referralBalance,
            referralEnabled:userData.referralEnabled,
            referralProgramApplied:userData.referralProgramApplied,
            referralProgramAppliedAt:userData.referralProgramAppliedAt,
            accountName:userData.accountName,
            bankName:userData.bankName,
            accountNumber:userData.accountNumber,
            ...userData // Spread any additional properties
        };

        return user;
    }

    return null;
}

async function updateUser(userId: string, data: Partial<UserModel>) {
    try {
        const userRef = doc(userCol, userId);
        await updateDoc(userRef, data);
        console.log(`User ${userId} updated successfully with data:`, data);
    } catch (error) {
        console.error(`Error updating user ${userId}:`, error);
        throw error; // Rethrow the error to be handled by the caller
    }
}


async function getAllUsers() {
    const q = query(
        userCol,
    );

    const querySnapshot = await getDocs(q);
    console.log(querySnapshot.docs.length);
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as UserModel[];
}

// In your @/server/user.ts file, add this function:
export const updateUserReferralStatus = async (userId: string, referralEnabled: boolean) => {
    try {
        // Reference to the user document
        const userRef = doc(db, 'users', userId);
        
        // Update only the referralEnabled field
        await updateDoc(userRef, {
            referralEnabled: referralEnabled,
            updatedAt: Timestamp.now()
        });
        
        return true;
    } catch (error) {
        console.error('Error updating user referral status:', error);
        throw error;
    }
};
export { getUserById, getAllUsers, updateUser };