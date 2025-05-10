import { DrugCategory, DrugModel, NewStockData, StockItem, UpdateStockData } from "@/app/model/drug_model";
import { db, storage } from "@/firebase/clientApp";
import { addDoc, arrayRemove, arrayUnion, collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";

const drugCol = collection(db, 'Drugs');
const drugCatCol = collection(db, 'DrugCategories');

// Helper function to get pharmacyId from cookies
function getPharmacyId(): string {
    if (typeof window === 'undefined') return ''; // SSR guard
    const value = `; ${document.cookie}`;
    const parts = value.split(`; pharmacyId=`);
    if (parts.length === 2) return parts.pop()!.split(';').shift()!;
    return '';
}

async function getProducts() {
    const pharmacyId = getPharmacyId();
    if (!pharmacyId) throw new Error('Not authenticated');

    const q = query(drugCol, where('pharmacyId', '==', pharmacyId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function getActiveStocks() {
    const pharmacyId = getPharmacyId();
    if (!pharmacyId) throw new Error('Not authenticated');
    console.log(pharmacyId);
    const q = query(
        drugCol,
        where('pharmacyId', '==', pharmacyId),
        where('remaining', '>=', 1)
    );
    const drugSnap = await getDocs(q);

    const drugs: DrugModel[] = drugSnap.docs.map((doc) => {
        const data = doc.data();
        return {
            id: doc.id,
            name: data.name,
            images: data.images || [],
            remaining: data.remaining,
            pharamcyId: data.pharmacyId,
            description: data.description,
            amount: data.amount,
            createdAt: data.createdAt,
        };
    });

    return drugs;
}
async function getOutOfStocks() {
    const pharmacyId = getPharmacyId();
    if (!pharmacyId) throw new Error('Not authenticated');
    console.log(pharmacyId);
    const q = query(
        drugCol,
        where('pharmacyId', '==', pharmacyId),
        where('remaining', '==', 0)
    );
    const drugSnap = await getDocs(q);
    const drugs: DrugModel[] = drugSnap.docs.map((doc) => {
        const data = doc.data();
        return {
            id: doc.id,
            name: data.name,
            images: data.images || [],
            remaining: data.remaining,
            pharamcyId: data.pharmacyId,
            description: data.description,
            amount: data.amount,
            createdAt: data.createdAt,
        };
    });
    return drugs;
}


async function getOutOfStockStocks() {
    const pharmacyId = getPharmacyId();
    if (!pharmacyId) throw new Error('Not authenticated');

    const q = query(
        drugCol,
        where('pharmacyId', '==', pharmacyId),
        where('remaining', '==', 0)
    );
    const drugSnap = await getDocs(q);
    return drugSnap.docs.map((doc) => doc.data());
}

async function newStock(data: NewStockData) {
    const pharmacyId = getPharmacyId();
    if (!pharmacyId) throw new Error('Not authenticated');

    // Add pharmacyId to the new stock data
    const stockData = { ...data, pharmacyId };
    const res = await addDoc(drugCol, stockData);
    const docId = res.id;
    const docRef = doc(drugCol, docId);
    await updateDoc(docRef, { id: docId });
    return docId;
}

async function getDrugCat(): Promise<DrugCategory[]> {
    const pharmacyId = getPharmacyId();
    if (!pharmacyId) throw new Error('Not authenticated');

    const q = query(drugCatCol);
    const drugCatSnap = await getDocs(q);

    return drugCatSnap.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || '', // fallback to empty string if name is missing
    }));
}


async function getStockById(id: string): Promise<StockItem | undefined> {
    const pharmacyId = getPharmacyId();
    if (!pharmacyId) throw new Error('Not authenticated');

    const docRef = doc(db, 'Drugs', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const stock = docSnap.data();
        // Verify the stock belongs to this pharmacy
        if (stock.pharmacyId !== pharmacyId) {
            return undefined;
        }
        return { id: docSnap.id, ...stock } as StockItem;
    }
    return undefined;
}

async function updateStock(id: string, data: UpdateStockData) {
    const pharmacyId = getPharmacyId();
    if (!pharmacyId) throw new Error('Not authenticated');

    const docRef = doc(db, 'Drugs', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        throw new Error('Stock not found');
    }

    const stockData = docSnap.data();

    // Check ownership
    if (stockData.pharmacyId !== pharmacyId) {
        throw new Error('You do not have permission to update this stock');
    }

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
    const pharmacyId = getPharmacyId();
    if (!pharmacyId) throw new Error('Not authenticated');

    const docRef = doc(db, 'Drugs', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists() && docSnap.data().pharmacyId === pharmacyId) {
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
    const pharmacyId = getPharmacyId();
    if (!pharmacyId) throw new Error('Not authenticated');

    const docRef = doc(db, 'Drugs', id);
    const docSnap = await getDoc(docRef);

    // Verify ownership before updating
    if (!docSnap.exists() || docSnap.data().pharmacyId !== pharmacyId) {
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
    getActiveStocks,
    getOutOfStocks,
    getOutOfStockStocks,
    newStock,
    getDrugCat,
    getStockById,
    updateStock,
    restockProduct,
    updateProductImages
};