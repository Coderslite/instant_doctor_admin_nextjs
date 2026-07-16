import { collection, doc, getDoc, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@/firebase/clientApp";
import { LabresultModel } from "@/app/model/labresult_model";
const labresultCol = collection(db, "LabResults");

async function getLabresult() {
    const q = query(
        labresultCol,
    );

    const querySnapshot = await getDocs(q);
    console.log(querySnapshot.docs.length);
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as LabresultModel[];
}

export {
    getLabresult,
};