// src/server/pharmacies.ts
import { collection, doc, getDoc, getDocs, orderBy, query, setDoc, updateDoc, where, writeBatch } from 'firebase/firestore'
import { NewPharmacyData, PharmacyModel } from '@/app/model/pharmacy_model'
import { GeoPoint, Timestamp } from 'firebase/firestore'
import { db, storage } from '@/firebase/clientApp'
import { OrderModel } from '@/app/model/order_model'
import { DrugModel } from '@/app/model/drug_model'
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'

export const getPharmacies = async (): Promise<PharmacyModel[]> => {
    try {
        const q = query(collection(db, 'Pharmacies'), where('status','!=','deleted'));
        const querySnapshot = await getDocs(q)
        const pharmacies: PharmacyModel[] = []

        querySnapshot.forEach((doc) => {
            const data = doc.data()
            pharmacies.push({
                id: doc.id,
                name: data.name,
                address: data.address,
                location: data.location as GeoPoint,
                deliveryFee: data.deliveryFee,
                email: data.email,
                phoneNumber: data.phoneNumber,
                image: data.image,
                password: data.password,
                createdAt: data.createdAt as Timestamp,
                status: data.status,
            })
        })

        return pharmacies
    } catch (error) {
        console.error('Error fetching pharmacies:', error)
        throw error
    }
}

export const getPharmacyById = async (id: string): Promise<PharmacyModel | null> => {
    try {
        const docRef = doc(db, 'Pharmacies', id)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            const data = docSnap.data()
            return {
                id: docSnap.id,
                name: data.name,
                address: data.address,
                location: data.location as GeoPoint,
                deliveryFee: data.deliveryFee,
                email: data.email,
                phoneNumber: data.phoneNumber,
                image: data.image,
                password: data.password,
                createdAt: data.createdAt as Timestamp,
                status: data.status,
            }
        }
        return null
    } catch (error) {
        console.error('Error fetching pharmacy:', error)
        throw error
    }
}

export const createPharmacy = async (pharmacyData: NewPharmacyData): Promise<string> => {
    try {
        const docRef = doc(collection(db, 'Pharmacies'));
        let imageUrl = '';

        // Upload image to Firebase Storage if provided
        if (pharmacyData.imageFile) {
            const storageRef = ref(storage, `pharmacy-images/${docRef.id}/${pharmacyData.imageFile.name}`);
            await uploadBytes(storageRef, pharmacyData.imageFile);
            imageUrl = await getDownloadURL(storageRef);
        }
        const pharmacy: PharmacyModel = {
            id: docRef.id, // Save the document ID
            name: pharmacyData.name,
            address: pharmacyData.address,
            location: new GeoPoint(
                pharmacyData.location.latitude,
                pharmacyData.location.longitude
            ),
            deliveryFee: pharmacyData.deliveryFee || '0',
            email: pharmacyData.email,
            phoneNumber: pharmacyData.phoneNumber || '',
            image: imageUrl || '',
            password: pharmacyData.password, // Include password
            createdAt: Timestamp.now(),
            status: pharmacyData.status,
        };

        await setDoc(docRef, pharmacy);
        return docRef.id;
    } catch (error) {
        console.error('Error creating pharmacy:', error);
        throw error;
    }
};


export async function getPharmacyStocks(pharmacyId: string): Promise<DrugModel[]> {
    const q = query(
        collection(db, 'Drugs'),
        where('pharmacyId', '==', pharmacyId)
    )

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as DrugModel[]
}

export async function getPharmacyOrders(pharmacyId: string): Promise<OrderModel[]> {
    const q = query(
        collection(db, 'Orders'),
        where('pharmacyId', '==', pharmacyId),
        orderBy('createdAt', 'desc')
    )

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as OrderModel[]
}

// export async function getPharmacyRevenue(pharmacyId: string): Promise<number> {
//     const q = query(
//         collection(db, 'Orders'),
//         where('pharmacyId', '==', pharmacyId),
//         where('status', '==', 'completed')
//     )

//     const querySnapshot = await getDocs(q)
//     return querySnapshot.docs.reduce((total, doc) => {
//         const order = doc.data() as OrderModel
//         return total + (order.totalAmount || 0)
//     }, 0)
// }

// src/server/pharmacies.ts (add this function)
export async function getPharmacyRevenue(pharmacyId: string): Promise<number> {
    try {
        // Get all completed orders for this pharmacy
        const q = query(
            collection(db, 'Orders'),
            where('pharmacyId', '==', pharmacyId),
            where('status', '==', 'completed')
        )

        const querySnapshot = await getDocs(q)

        // Calculate total revenue from all completed orders
        let totalRevenue = 0

        querySnapshot.forEach((doc) => {
            const order = doc.data() as OrderModel
            // Sum up the totalAmount for each order (which should already include items and delivery fee)
            totalRevenue += order.totalAmount || 0
        })

        return totalRevenue
    } catch (error) {
        console.error('Error calculating pharmacy revenue:', error)
        throw error
    }
}


export const updatePharmacy = async (
    id: string,
    pharmacyData: Partial<PharmacyModel>,
    newImageFile?: File
): Promise<void> => {
    try {
        const docRef = doc(db, 'Pharmacies', id);
        const updateData: Partial<PharmacyModel> = { ...pharmacyData };

        // Handle image upload if new image is provided
        if (newImageFile) {
            // Delete old image if exists
            const pharmacyDoc = await getDoc(docRef);
            const oldImageUrl = pharmacyDoc.data()?.imageUrl;
            if (oldImageUrl) {
                try {
                    const oldImageRef = ref(storage, oldImageUrl);
                    await deleteObject(oldImageRef);
                } catch (error) {
                    console.log("Old image not found, skipping deletion");
                }
            }

            // Upload new image
            const storageRef = ref(storage, `pharmacy-images/${id}/${newImageFile.name}`);
            await uploadBytes(storageRef, newImageFile);
            updateData.image = await getDownloadURL(storageRef);
        }

        await updateDoc(docRef, updateData);
    } catch (error) {
        console.error('Error updating pharmacy:', error);
        throw error;
    }
};



export const deletePharmacy = async (pharmacyId: string): Promise<void> => {
    try {
        const batch = writeBatch(db);
        const timestamp = Timestamp.now();

        // 1. Mark pharmacy as deleted
        const pharmacyRef = doc(db, 'Pharmacies', pharmacyId);
        batch.update(pharmacyRef, {
            status: 'deleted',
            deletedAt: timestamp
        });

        // 2. Mark all pharmacy's stocks as deleted
        const drugsRef = collection(db, 'Drugs');
        const q = query(drugsRef, where('pharmacyId', '==', pharmacyId));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((drugDoc) => {
            const drugRef = doc(db, 'Drugs', drugDoc.id);
            batch.update(drugRef, {
                status: 'deleted',
                deletedAt: timestamp
            });
        });

        // Commit the batch
        await batch.commit();
    } catch (error) {
        console.error('Error deleting pharmacy:', error);
        throw error;
    }
};