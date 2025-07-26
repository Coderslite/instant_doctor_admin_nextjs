import { AppointmentModel } from "@/app/model/appointment_model";
import { UserModel } from "@/app/model/user_model";
import { db } from "@/firebase/clientApp";
import { collection, getDocs, query, where, orderBy, doc, getDoc, limit, updateDoc, or, and } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";

const appointmentCol = collection(db, "Appointments");
const userCol = collection(db, "Users");

// Helper function to format dates
function formatDate(timestamp: Timestamp): string {
    if (!timestamp) return 'No date set';
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Helper function to format time
function formatTime(timestamp: Timestamp): string {
    if (!timestamp) return 'No time set';
    const date = timestamp.toDate();
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

// Helper function to get time range
function formatTimeRange(startTime: Timestamp, endTime: Timestamp): string {
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
}

// Helper function to get status with appropriate styling classes
function getStatusInfo(status: string) {
    switch (status.toLowerCase()) {
        case 'pending':
            return {
                text: 'Pending',
                class: 'bg-yellow-100 text-yellow-800'
            };
        case 'confirmed':
            return {
                text: 'Confirmed',
                class: 'bg-blue-100 text-blue-800'
            };
        case 'completed':
            return {
                text: 'Completed',
                class: 'bg-green-100 text-green-800'
            };
        case 'active':
            return {
                text: 'Active',
                class: 'bg-green-100 text-green-600'
            };
        case 'cancelled':
            return {
                text: 'Cancelled',
                class: 'bg-red-100 text-red-800'
            };
        case 'ongoing':
            return {
                text: 'Ongoing',
                class: 'bg-purple-100 text-purple-800'
            };
        default:
            return {
                text: 'Unknown',
                class: 'bg-gray-100 text-gray-800'
            };
    }
}

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

async function getPatientName(patientId: string): Promise<string> {
    const docRef = doc(userCol, patientId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data() as UserModel;
        return `${data.firstname} ${data.lastname}`;
    }
    return 'Unknown Patient';
}

// Enhanced appointment model with formatted dates and status info
export type EnhancedAppointmentModel = AppointmentModel & {
    doctorName: string;
    patientName: string;
    formattedDate: string;
    formattedTime: string;
    formattedTimeRange: string;
    statusInfo: ReturnType<typeof getStatusInfo>;
    isPast: boolean;
    isUpcoming: boolean;
    isOngoing: boolean;
};

function enhanceAppointmentData(data: any, doctorName: string, patientName: string): EnhancedAppointmentModel {
    const now = Timestamp.now();
    const startTime = data.startTime || Timestamp.now();
    const endTime = data.endTime || Timestamp.now();
    
    const isPast = endTime.toMillis() < now.toMillis();
    const isUpcoming = startTime.toMillis() > now.toMillis();
    const isOngoing = startTime.toMillis() <= now.toMillis() && endTime.toMillis() >= now.toMillis();

    return {
        id: data.id,
        userId: data.userId,
        doctorId: data.doctorId || null,
        doctorName,
        patientName,
        complain: data.complain || '',
        price: data.price || 0,
        startTime,
        endTime,
        isPaid: data.isPaid || false,
        isTrial: data.isTrial || false,
        createdAt: data.createdAt || Timestamp.now(),
        status: data.status || 'pending',
        
        // Formatted fields
        formattedDate: formatDate(startTime),
        formattedTime: formatTime(startTime),
        formattedTimeRange: formatTimeRange(startTime, endTime),
        statusInfo: getStatusInfo(data.status || 'pending'),
        
        // Status flags
        isPast,
        isUpcoming,
        isOngoing
    };
}

export async function getAppointmentsByUserId(userId: string): Promise<EnhancedAppointmentModel[]> {
    const q = query(
        appointmentCol,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const appointments = await Promise.all(
        snapshot.docs.map(async (doc) => {
            const data = doc.data();
            const doctorName = await getDoctorName(data.doctorId || null);
            const patientName = await getPatientName(data.userId);
            return enhanceAppointmentData({ ...data, id: doc.id }, doctorName, patientName);
        })
    );

    return appointments;
}

export async function getAppointmentById(id: string): Promise<EnhancedAppointmentModel | null> {
    const docRef = doc(appointmentCol, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    const doctorName = await getDoctorName(data.doctorId || null);
    const patientName = await getPatientName(data.userId);

    return enhanceAppointmentData({ ...data, id: docSnap.id }, doctorName, patientName);
}

export async function getUpcomingAppointments(limitCount: number = 5): Promise<EnhancedAppointmentModel[]> {
    const q = query(
        appointmentCol,
        where('startTime', '>', Timestamp.now()),
        orderBy('startTime', 'asc'),
        limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const appointments = await Promise.all(
        snapshot.docs.map(async (doc) => {
            const data = doc.data();
            const doctorName = await getDoctorName(data.doctorId || null);
            const patientName = await getPatientName(data.userId);
            return enhanceAppointmentData({ ...data, id: doc.id }, doctorName, patientName);
        })
    );

    return appointments;
}

export async function getAppointmentsByDoctorId(doctorId: string): Promise<EnhancedAppointmentModel[]> {
    const q = query(
        appointmentCol,
        where('doctorId', '==', doctorId),
        orderBy('startTime', 'desc')
    );

    const snapshot = await getDocs(q);
    const appointments = await Promise.all(
        snapshot.docs.map(async (doc) => {
            const data = doc.data();
            const doctorName = await getDoctorName(data.doctorId || null);
            const patientName = await getPatientName(data.userId);
            return enhanceAppointmentData({ ...data, id: doc.id }, doctorName, patientName);
        })
    );

    return appointments;
}

export async function getPendingAppointments(): Promise<EnhancedAppointmentModel[]> {
    const q = query(
        appointmentCol,
        and(
            where('status', '==', 'pending'),
            or(
                where('isPaid', '==', true),
                where('isTrial', '==', true)
            )
        ),
        orderBy('startTime', 'asc')
    );

    const snapshot = await getDocs(q);
    const appointments = await Promise.all(
        snapshot.docs.map(async (doc) => {
            const data = doc.data();
            const doctorName = await getDoctorName(data.doctorId || null);
            const patientName = await getPatientName(data.userId);
            return enhanceAppointmentData({ ...data, id: doc.id }, doctorName, patientName);
        })
    );

    return appointments;
}

export async function getAllAppointments(): Promise<EnhancedAppointmentModel[]> {
    const q = query(
        appointmentCol,
        where('isPaid', '==', true),
        orderBy('startTime', 'asc')
    );

    const snapshot = await getDocs(q);
    const appointments = await Promise.all(
        snapshot.docs.map(async (doc) => {
            const data = doc.data();
            const doctorName = await getDoctorName(data.doctorId || null);
            const patientName = await getPatientName(data.userId);
            return enhanceAppointmentData({ ...data, id: doc.id }, doctorName, patientName);
        })
    );

    return appointments;
}

export async function getOngoingAppointments(): Promise<EnhancedAppointmentModel[]> {
    const q = query(
        appointmentCol,
        where('startTime', '<=', Timestamp.now()),
        where('endTime', '>', Timestamp.now()),
        orderBy('startTime', 'asc')
    );

    const snapshot = await getDocs(q);
    const appointments = await Promise.all(
        snapshot.docs.map(async (doc) => {
            const data = doc.data();
            const doctorName = await getDoctorName(data.doctorId || null);
            const patientName = await getPatientName(data.userId);
            return enhanceAppointmentData({ ...data, id: doc.id }, doctorName, patientName);
        })
    );

    return appointments;
}

export async function getCancelledAppointments(): Promise<EnhancedAppointmentModel[]> {
    const q = query(
        appointmentCol,
        where('status', '==', 'cancelled'),
        orderBy('startTime', 'asc')
    );

    const snapshot = await getDocs(q);
    const appointments = await Promise.all(
        snapshot.docs.map(async (doc) => {
            const data = doc.data();
            const doctorName = await getDoctorName(data.doctorId || null);
            const patientName = await getPatientName(data.userId);
            return enhanceAppointmentData({ ...data, id: doc.id }, doctorName, patientName);
        })
    );

    return appointments;
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
        where('role', '==', 'doctor')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as UserModel));
}