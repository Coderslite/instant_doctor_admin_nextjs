import { AppointmentModel } from "@/app/model/appointment_model";
import { OrderModel } from "@/app/model/order_model";
import { PharmacyModel } from "@/app/model/pharmacy_model";
import { UserModel } from "@/app/model/user_model";
import { db } from "@/firebase/clientApp";
import { collection, getDocs, query, where } from "firebase/firestore";

// Get total pharmacy earnings from completed orders (sum of all item amounts)
export async function getTotalPharmacyEarnings() {
    const ordersRef = collection(db, "Orders");
    const completedOrdersQuery = query(ordersRef, where("status", "==", "completed"));
    const snapshot = await getDocs(completedOrdersQuery);

    let total = 0;
    snapshot.forEach(doc => {
        const order = doc.data() as OrderModel;
        // Sum up all items in the order (excluding delivery fee)
        const orderTotal = order.items.reduce((sum, item) => sum + (item.amount * item.quantity), 0);
        total += orderTotal;
    });

    return total;
}

// Get total doctor earnings from completed appointments
export async function getTotalDoctorEarnings() {
    const appointmentsRef = collection(db, "Appointments");
    const completedAppointmentsQuery = query(
        appointmentsRef,
        where("status", "==", "completed"),
        where("isPaid", "==", true)
    );
    const snapshot = await getDocs(completedAppointmentsQuery);

    let total = 0;
    snapshot.forEach(doc => {
        const appointment = doc.data() as AppointmentModel;
        total += appointment.price || 0;
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
        total += data.balance || 0;
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
        total += data.amount || 0;
    });

    return total;
}