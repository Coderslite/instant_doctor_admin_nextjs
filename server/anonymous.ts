import { collection, doc, getDoc, getDocs, query, orderBy, updateDoc, where } from "firebase/firestore";
import { db } from "@/firebase/clientApp";
import { getUserById } from "./user";
import { sendNotification } from "@/utils/sendNotification";
import { UserModel } from "@/app/model/user_model";

const anonymousCol = collection(db, "AnonymousQuestions");

interface AnonymousModel {
    id: string;
    question: string;
    answer?: string;
    userId: string;
    status: 'pending' | 'completed';
    createdAt: Date;
    updatedAt: Date;
}

async function getPendingAnonymousMessages(): Promise<AnonymousModel[]> {
    const q = query(
        anonymousCol,
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
    })) as AnonymousModel[];
}


async function getAllAnonymousMessages(): Promise<AnonymousModel[]> {
    const q = query(
        anonymousCol,
        orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
    })) as AnonymousModel[];
}


async function getAnonymousMessageById(id: string): Promise<AnonymousModel | null> {
    const docRef = doc(anonymousCol, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return {
            id: docSnap.id,
            ...docSnap.data(),
            createdAt: docSnap.data().createdAt.toDate(),
            updatedAt: docSnap.data().updatedAt?.toDate()
        } as AnonymousModel;
    }
    return null;
}

async function updateAnonymousMessage(id: string, answer: string): Promise<void> {
    const docRef = doc(anonymousCol, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        await updateDoc(docRef, {
            answer,
            status: 'completed',
            updatedAt: new Date()
        });
        const user: UserModel | null = await getUserById(docSnap.data().userId);
        if (user) {
            sendNotification(user, "Anonymous Answer", 'your answer is now available', id, 'anonymous');
        } else {
            console.warn(`User not found for ID: ${docSnap.data().userId}`);
        }
    }
}

export {
    getAllAnonymousMessages,
    getAnonymousMessageById,
    updateAnonymousMessage,
    getPendingAnonymousMessages,
};

export type { AnonymousModel };