import { UserModel } from "@/app/model/user_model";
import { collection, doc, getDoc, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@/firebase/clientApp";
const userCol = collection(db, "Users");

async function getPatients() {
    const q = query(
        userCol,
        where('role', '==', 'User'),
        orderBy('lastSeen', 'desc')
    );

    const querySnapshot = await getDocs(q);
    console.log(querySnapshot.docs.length);
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as UserModel[];
}

export {
    getPatients,
};