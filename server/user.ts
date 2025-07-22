import { UserModel } from "@/app/model/user_model";
import { db } from "@/firebase/clientApp";
import { collection, doc, getDoc, updateDoc, DocumentData } from "firebase/firestore";

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

export { getUserById, updateUser };