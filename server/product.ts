import { DrugCategory, DrugModel, NewStockData, StockItem, UpdateStockData } from "@/app/model/drug_model";
import { db, storage } from "@/firebase/clientApp";
import { addDoc, arrayRemove, arrayUnion, collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";

const drugCol = collection(db, 'Products');
const drugCatCol = collection(db, 'ProductCategories');



async function getProducts() {
    const q = query(drugCol);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export const getActiveStocks = async (pharmacyId: string): Promise<DrugModel[]> => {
    console.log(pharmacyId);
    const q = query(
        collection(db, 'Products'),
        where('pharmacyId', '==', pharmacyId),
        where('remaining', '>=', 1),
        // where('status', '==', 'active')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as DrugModel[];
};
export const getOutOfStocks = async (pharmacyId: string): Promise<DrugModel[]> => {
    console.log(pharmacyId);
    const q = query(
        collection(db, 'Products'),
        where('pharmacyId', '==', pharmacyId),
        where('remaining', '==', 0),
        // where('status', '==', 'active')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as DrugModel[];
};


async function getOutOfStockStocks() {
    const q = query(
        drugCol,
        where('remaining', '==', 0)
    );
    const drugSnap = await getDocs(q);
    return drugSnap.docs.map((doc) => doc.data());
}

async function newStock(data: NewStockData) {
    // Add pharmacyId to the new stock data
    const stockData = { ...data };
    const res = await addDoc(drugCol, stockData);
    const docId = res.id;
    const docRef = doc(drugCol, docId);
    await updateDoc(docRef, { id: docId });
    return docId;
}

async function getDrugCat(): Promise<DrugCategory[]> {
    const q = query(drugCatCol);
    const drugCatSnap = await getDocs(q);

    return drugCatSnap.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || '', // fallback to empty string if name is missing
    }));
}


async function getStockById(id: string): Promise<StockItem | undefined> {
    const docRef = doc(db, 'Products', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const stock = docSnap.data();
        return { id: docSnap.id, ...stock } as StockItem;
    }
    return undefined;
}

async function updateStock(id: string, data: UpdateStockData) {

    const docRef = doc(db, 'Products', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        throw new Error('Stock not found');
    }

    const stockData = docSnap.data();

    // Remove undefined fields
    const cleanData = removeUndefined(data);

    if (Object.keys(cleanData).length === 0) {
        throw new Error('No valid fields to update');
    }

    await updateDoc(docRef, cleanData);
}


function removeUndefined<T extends object>(obj: T): Partial<T> {
    return Object.fromEntries(
        Object.entries(obj).filter(([_, v]) => v !== undefined)
    ) as Partial<T>;
}


async function restockProduct(id: string, quantityToAdd: number) {

    const docRef = doc(db, 'Products', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const currentQuantity = docSnap.data().quantity;
        const currentRemaining = docSnap.data().remaining;

        await updateDoc(docRef, {
            quantity: currentQuantity + quantityToAdd,
            remaining: currentRemaining + quantityToAdd
        });
    } else {
        throw new Error('Product not found or not owned by your pharmacy');
    }
}

async function updateProductImages(id: string, newImages: string[], deletedImages: string[]) {
    const docRef = doc(db, 'Products', id);
    const docSnap = await getDoc(docRef);

    // Verify ownership before updating
    if (!docSnap.exists()) {
        throw new Error('Product not found or not owned by your pharmacy');
    }

    // First delete images from storage
    const deletePromises = deletedImages.map(async (imageUrl) => {
        const imageRef = ref(storage, imageUrl);
        try {
            await deleteObject(imageRef);
        } catch (error) {
            console.error('Error deleting image:', error);
        }
    });

    await Promise.all(deletePromises);

    // Then update Firestore document
    await updateDoc(docRef, {
        images: arrayUnion(...newImages),
        ...(deletedImages.length > 0 && {
            images: arrayRemove(...deletedImages)
        })
    });
}

export {
    getProducts,
    getOutOfStockStocks,
    newStock,
    getDrugCat,
    getStockById,
    updateStock,
    restockProduct,
    updateProductImages
};