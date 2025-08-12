import { WaitlistModel } from "@/app/model/waitlist_model";
import { db } from "@/firebase/clientApp";
import { sendNotification } from "@/utils/sendNotification";
import { collection, doc, getDocs, orderBy, query, updateDoc } from "firebase/firestore";
import { getUserById } from "./user";

const wailtlistCol = collection(db, 'Waitlist');

export async function getWaitlist(): Promise<WaitlistModel[]> {
    const q = query(wailtlistCol, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        status: doc.data().status ?? 'pending',
        ...doc.data(),
    })) as WaitlistModel[];
}


export const updateWaitlist = async (id: string, userId: string) => {
    const waitlistRef = doc(wailtlistCol, id);
    await updateDoc(waitlistRef, { "status": "completed" });
    const user = await getUserById(userId);
    if (user != null) {
        sendNotification(user, "New Pharmacy Added", "your request pharmacy has been added, click to see", id, 'pharmacy');
    }
    console.log(`Waitlist Added updated successfully`);
}

// async function getAllAnonymousMessages(): Promise<AnonymousModel[]> {
//     const q = query(
//         anonymousCol,
//         orderBy('createdAt', 'desc')
//     );

//     const querySnapshot = await getDocs(q);
//     return querySnapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data(),
//         createdAt: doc.data().createdAt.toDate(),
//         updatedAt: doc.data().updatedAt?.toDate()
//     })) as AnonymousModel[];
// }