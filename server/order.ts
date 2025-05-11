import { ItemModel, OrderModel } from "@/app/model/order_model";
import { db } from "@/firebase/clientApp";
import { collection, doc, getDoc, getDocs, limit, orderBy, query, Timestamp, updateDoc, where } from "firebase/firestore";

const orderCol = collection(db, "Orders");

// Helper function to get pharmacyId from cookies
function getPharmacyId(): string {
    if (typeof window === 'undefined') return ''; // SSR guard
    const value = `; ${document.cookie}`;
    const parts = value.split(`; pharmacyId=`);
    if (parts.length === 2) return parts.pop()!.split(';').shift()!;
    return '';
}

async function getAllOrdersLimitFive(): Promise<OrderModel[]> {
    const pharmacyId = getPharmacyId();
    console.log(pharmacyId);

    const q = query(
        orderCol,
        where('pharmacyId', '==', pharmacyId),
        limit(5)
    );

    const snapSnapshot = await getDocs(q);

    const orders = snapSnapshot.docs.map((doc) => {
        const data = doc.data();

        // Explicitly map to OrderModel with proper typing
        const order: OrderModel = {
            id: doc.id,
            name: data.name || '',
            totalAmount: data.totalAmount || 0,
            createdAt: data.createdAt || Timestamp.now(),
            remaining: data.remaining || '',
            pharmacyId: data.pharmacyId || pharmacyId,
            userId: data.userId || '',
            trackingId: data.trackingId || '',
            items: data.items?.map((item: any) => ({
                amount: item.amount || 0,
                id: item.id || '',
                images: item.images || [],
                name: item.name || '',
                pharmacyId: item.pharmacyId || pharmacyId,
                quantity: item.quantity || 1
            } as ItemModel)) || [],
            status: data.status || 'pending',
            deliveryFee: data.deliveryFee || 0,
            address: data.address,
        };

        return order;
    });

    return orders;
}

export async function getOrdersForStaticGeneration(pharmacyId: string): Promise<{ id: string }[]> {
    const q = query(
        orderCol,
        where('pharmacyId', '==', pharmacyId),
        limit(20) // Adjust based on your needs
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id }));
}

async function getOrderById(id: string): Promise<OrderModel | undefined> {
    const docRef = doc(orderCol, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return undefined;

    const data = docSnap.data();


    return {
        id: docSnap.id,
        name: data.name || '',
        totalAmount: data.totalAmount || 0,
        createdAt: data.createdAt || Timestamp.now(),
        remaining: data.remaining || '',
        pharmacyId: data.pharmacyId || '',
        userId: data.userId || '',
        trackingId: data.trackingId || '',
        items: data.items?.map((item: any) => ({
            amount: item.amount || 0,
            id: item.id || '',
            images: item.images || [],
            name: item.name || '',
            pharmacyId: item.pharmacyId || '',
            quantity: item.quantity || 1
        } as ItemModel)) || [],
        status: data.status || 'pending',
        deliveryFee: data.deliveryFee || 0,
        address: data.address || ''
    };
}


async function getActiveOrdersCounts() {
    const pharmacyId = getPharmacyId();
    const q = query(
        orderCol,
        where("pharmacyId", "==", pharmacyId),
        where("status", '!=', 'pending'),
        where("status", "in", ["confirmed", "delivering"])
    );
    const snapSnapshot = await getDocs(q);
    return snapSnapshot.size;
}

async function getPendingOrdersCounts() {
    const pharmacyId = getPharmacyId();
    const q = query(
        orderCol,
        where("pharmacyId", "==", pharmacyId),
        where("status", "==", 'pending'),
        limit(5)
    );
    const snapSnapshot = await getDocs(q);
    return snapSnapshot.size;
}

async function getCompletedOrdersCounts() {
    const pharmacyId = getPharmacyId();
    const q = query(
        orderCol,
        where("pharmacyId", "==", pharmacyId),
        where("status", "==", 'completed'),
    );
    const snapSnapshot = await getDocs(q);
    return snapSnapshot.size;
}

async function updateOrderStatusInFirestore(orderId: string, newStatus: string) {
    const pharmacyId = getPharmacyId();
    const orderRef = doc(db, 'Orders', orderId);
    const orderSnap = await getDoc(orderRef);

    if (orderSnap.exists() && orderSnap.data().pharmacyId === pharmacyId) {
        await updateDoc(orderRef, {
            status: newStatus,
            updatedAt: new Date()
        });
        return true;
    }
    return false;
}

async function getDeliveredOrders() {
    const pharmacyId = getPharmacyId();
    const q = query(
        orderCol,
        where('pharmacyId', '==', pharmacyId),
        where('status', '==', 'completed'),
        orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as OrderModel[];
}

async function getPendingOrders() {
    const pharmacyId = getPharmacyId();
    const q = query(
        orderCol,
        where('pharmacyId', '==', pharmacyId),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as OrderModel[];
}

async function getCancelledOrders() {
    const pharmacyId = getPharmacyId();
    const q = query(
        orderCol,
        where('pharmacyId', '==', pharmacyId),
        where('status', '==', 'cancelled'),
        orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as OrderModel[];
}

export {
    getAllOrdersLimitFive,
    getActiveOrdersCounts,
    getPendingOrdersCounts,
    getCompletedOrdersCounts,
    getOrderById,
    updateOrderStatusInFirestore,
    getDeliveredOrders,
    getPendingOrders,
    getCancelledOrders
};