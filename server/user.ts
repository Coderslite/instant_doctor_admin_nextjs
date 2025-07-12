import { UserModel } from "@/app/model/user_model";
import { db } from "@/firebase/clientApp";
import { collection, doc, getDoc, DocumentData } from "firebase/firestore";

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
            // Add any other required properties from UserModel
            ...userData // This spreads any additional properties that might be in the document
            ,

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
        };

        return user;
    }

    return null;
}

async function updateUser(userId: string, date: {}) {

}
export { getUserById, updateUser };