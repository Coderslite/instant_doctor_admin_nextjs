import { AppointmentModel } from "@/app/model/appointment_model";
import { UserModel } from "@/app/model/user_model";
import { db } from "@/firebase/clientApp";
import { collection, getDocs, query, where, orderBy, doc, getDoc, limit, updateDoc } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";

const appointmentCol = collection(db, "Appointments");
const userCol = collection(db, "Users");

// Helper function to get pharmacyId from cookies
function getPharmacyId(): string {
    if (typeof window === 'undefined') return ''; // SSR guard
    const value = `; ${document.cookie}`;
    const parts = value.split(`; pharmacyId=`);
    if (parts.length === 2) return parts.pop()!.split(';').shift()!;
    return '';
}

async function getDoctorName(doctorId: string | null): Promise<string> {
    if (!doctorId) return 'Not assigned yet';

    const docRef = doc(userCol, doctorId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data() as UserModel;
        return `${data.firstname} ${data.lastname}`;
    }
    return 'Unknown Doctor';
}

export async function getAppointmentsByUserId(userId: string): Promise<(AppointmentModel & { doctorName: string })[]> {
    const q = query(
        appointmentCol,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const appointmentsWithDoctorNames = await Promise.all(
        snapshot.docs.map(async (doc) => {
            const data = doc.data();
            const doctorName = await getDoctorName(data.doctorId || null);
            return {
                id: doc.id,
                userId: data.userId,
                doctorId: data.doctorId || null,
                doctorName: doctorName,
                complain: data.complain || '',
                price: data.price || 0,
                startTime: data.startTime || Timestamp.now(),
                endTime: data.endTime || Timestamp.now(),
                isPaid: data.isPaid || false,
                createdAt: data.createdAt || Timestamp.now(),
                status: data.status,
            };
        })
    );

    return appointmentsWithDoctorNames;
}

export async function getAppointmentById(id: string): Promise<(AppointmentModel & { doctorName: string; patientName: string }) | null> {
    const docRef = doc(appointmentCol, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    const doctorName = await getDoctorName(data.doctorId || null);
    const patientName = await getPatientName(data.userId);

    return {
        id: docSnap.id,
        userId: data.userId,
        doctorId: data.doctorId || null,
        doctorName: doctorName,
        patientName: patientName,
        complain: data.complain || '',
        price: data.price || 0,
        startTime: data.startTime || Timestamp.now(),
        endTime: data.endTime || Timestamp.now(),
        isPaid: data.isPaid || false,
        createdAt: data.createdAt || Timestamp.now(),
        status: data.status,

    };
}

export async function getUpcomingAppointments(limitCount: number = 5): Promise<(AppointmentModel & { doctorName: string })[]> {
    const q = query(
        appointmentCol,
        where('startTime', '>', Timestamp.now()),
        orderBy('startTime', 'asc'),
        limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const appointmentsWithDoctorNames = await Promise.all(
        snapshot.docs.map(async (doc) => {
            const data = doc.data();
            const doctorName = await getDoctorName(data.doctorId || null);
            const patientName = await getPatientName(data.userId);

            return {
                id: doc.id,
                userId: data.userId,
                doctorId: data.doctorId || null,
                doctorName: doctorName,
                patientName: patientName,
                complain: data.complain || '',
                price: data.price || 0,
                startTime: data.startTime || Timestamp.now(),
                endTime: data.endTime || Timestamp.now(),
                isPaid: data.isPaid || false,
                createdAt: data.createdAt || Timestamp.now(),
                status: data.status,
            };
        })
    );

    return appointmentsWithDoctorNames;
}


export async function getAppointmentsByDoctorId(doctorId: string): Promise<(AppointmentModel & { patientName: string })[]> {
    const q = query(
        appointmentCol,
        where('doctorId', '==', doctorId),
        orderBy('startTime', 'desc')
    );

    const snapshot = await getDocs(q);
    const appointmentsWithPatientNames = await Promise.all(
        snapshot.docs.map(async (doc) => {
            const data = doc.data();
            const patientName = await getPatientName(data.userId);

            return {
                id: doc.id,
                userId: data.userId,
                doctorId: data.doctorId,
                patientName: patientName,
                complain: data.complain || '',
                price: data.price || 0,
                startTime: data.startTime || Timestamp.now(),
                endTime: data.endTime || Timestamp.now(),
                isPaid: data.isPaid || false,
                createdAt: data.createdAt || Timestamp.now(),
                status: data.status,
            };
        })
    );

    return appointmentsWithPatientNames;
}

async function getPatientName(patientId: string): Promise<string> {
    const docRef = doc(userCol, patientId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data() as UserModel;
        return `${data.firstname} ${data.lastname}`;
    }
    return 'Unknown Patient';
}

export async function getPendingAppointments(): Promise<(AppointmentModel & { doctorName: string; patientName: string })[]> {
    const q = query(
        appointmentCol,
        // where('status', '==', 'pending'),
        orderBy('startTime', 'asc')
    );

    const snapshot = await getDocs(q);
    const appointmentsWithNames = await Promise.all(
        snapshot.docs.map(async (doc) => {
            const data = doc.data();
            const doctorName = data.doctorId ? await getDoctorName(data.doctorId) : 'Unassigned';
            const patientName = await getPatientName(data.userId);

            return {
                id: doc.id,
                userId: data.userId,
                doctorId: data.doctorId || null,
                doctorName: doctorName,
                patientName: patientName,
                complain: data.complain || '',
                price: data.price || 0,
                startTime: data.startTime || Timestamp.now(),
                endTime: data.endTime || Timestamp.now(),
                isPaid: data.isPaid || false,
                createdAt: data.createdAt || Timestamp.now(),
                status: data.status,
            };
        })
    );

    return appointmentsWithNames;
}

export async function updateAppointment(
    id: string,
    updates: Partial<AppointmentModel>
): Promise<void> {
    const docRef = doc(appointmentCol, id);
    await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
    });
}

export async function getAvailableDoctors(): Promise<UserModel[]> {
    const q = query(
        userCol,
        where('role', '==', 'Doctor') // Assuming you have a role field
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as UserModel));
}