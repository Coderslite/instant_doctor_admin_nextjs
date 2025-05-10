import { db } from "@/firebase/clientApp";
import { collection, doc, getDoc } from "firebase/firestore";

const userCol = collection(db, 'Users');
async function getUserById(id: string) {
    const userRef = doc(userCol, id);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        const user = userSnap.data();
        return user;
    }
    else {
       return undefined;
    }
}

export { getUserById };