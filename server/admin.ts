import { AppointmentModel } from "@/app/model/appointment_model";
import { OrderModel } from "@/app/model/order_model";
import { PharmacyModel } from "@/app/model/pharmacy_model";
import { UserModel } from "@/app/model/user_model";
import { db } from "@/firebase/clientApp";
import { collection, getDocs, query, where } from "firebase/firestore";

// Firestore values may be stored as strings or be missing; coerce safely
const toNumber = (value: unknown) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
};

// Get total pharmacy earnings from completed orders (sum of all item amounts)
export async function getTotalPharmacyEarnings() {
    const ordersRef = collection(db, "Orders");
    const completedOrdersQuery = query(ordersRef, where("status", "==", "completed"));
    const snapshot = await getDocs(completedOrdersQuery);

    let total = 0;
    snapshot.forEach(doc => {
        const order = doc.data() as OrderModel;
        // Sum up all items in the order (excluding delivery fee)
        const orderTotal = (order.items ?? []).reduce(
            (sum, item) => sum + toNumber(item.amount) * toNumber(item.quantity),
            0
        );
        total += orderTotal;
    });

    return total;
}

// Get total doctor earnings (NGN) from paid appointments.
// Appointments never reach a "completed" status (only pending/active/deleted),
// so isPaid is the signal. Trials are free and other currencies are skipped
// so they aren't summed as naira.
export async function getTotalDoctorEarnings() {
    const appointmentsRef = collection(db, "Appointments");
    const paidAppointmentsQuery = query(appointmentsRef, where("isPaid", "==", true));
    const snapshot = await getDocs(paidAppointmentsQuery);

    let total = 0;
    snapshot.forEach(doc => {
        const appointment = doc.data() as AppointmentModel & { currency?: string; isTrial?: boolean };
        if (appointment.isTrial) return;
        if (appointment.currency && appointment.currency !== "NGN") return;
        total += toNumber(appointment.price);
    });

    return total;
}

// Get total current pharmacy balances (sum of all pharmacy balances)
export async function getTotalPharmacyBalances() {
    const pharmaciesRef = collection(db, "Pharmacies");
    const snapshot = await getDocs(pharmaciesRef);

    let total = 0;
    snapshot.forEach(doc => {
        const data = doc.data() as PharmacyModel;
        total += toNumber(data.balance);
    });

    return total;
}

// Get total current doctor balances (sum of all doctor balances)
export async function getTotalDoctorBalances() {
    const doctorsRef = query(collection(db, "Users"), where('role', '==', 'Doctor'));
    const snapshot = await getDocs(doctorsRef);

    let total = 0;
    snapshot.forEach(doc => {
        const data = doc.data() as UserModel;
        total += toNumber(data.balance ?? data.amount);
    });

    return total;
}