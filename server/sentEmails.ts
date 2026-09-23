import { db } from "@/firebase/clientApp";
import { addDoc, collection, getDocs, limit, orderBy, query, Timestamp } from "firebase/firestore";

// Record of individual emails sent from the panel, so admins can see who sent what
export interface SentEmailModel {
    id: string;
    recipientId: string;
    recipientName: string;
    subject: string;
    message: string;
    sentById: string;
    sentByName: string;
    createdAt: Timestamp;
}

const sentEmailsCol = collection(db, 'SentEmails');

export async function logSentEmail(entry: Omit<SentEmailModel, 'id' | 'createdAt'>) {
    await addDoc(sentEmailsCol, { ...entry, createdAt: Timestamp.now() });
}

export async function getRecentSentEmails(count = 10): Promise<SentEmailModel[]> {
    const snapshot = await getDocs(query(sentEmailsCol, orderBy('createdAt', 'desc'), limit(count)));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as SentEmailModel[];
}
