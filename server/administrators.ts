import { AdminModel } from "@/app/model/admin_model";
import { db } from "@/firebase/clientApp";
import { hashPassword, verifyPassword } from "@/utils/password";
import { AdminRole, normalizeRole } from "@/utils/roles";
import { addDoc, collection, deleteDoc, deleteField, doc, getDoc, getDocs, query, Timestamp, updateDoc, where } from "firebase/firestore";

const administratorCol = collection(db, 'Administrator');

export async function getAdministrators(): Promise<AdminModel[]> {
    const snapshot = await getDocs(administratorCol);
    // Map explicitly so password fields never reach the UI
    return snapshot.docs.map(d => {
        const data = d.data();
        return {
            id: d.id,
            name: data.name ?? '',
            email: data.email ?? '',
            role: normalizeRole(data.role),
            createdAt: data.createdAt,
        };
    });
}

export async function createAdministrator(input: { name: string; email: string; password: string; role: AdminRole }) {
    const email = input.email.trim().toLowerCase();
    const existing = await getDocs(query(administratorCol, where('email', '==', email)));
    if (!existing.empty) {
        throw new Error('A user with this email already exists');
    }

    await addDoc(administratorCol, {
        name: input.name.trim(),
        email,
        role: input.role,
        ...(await hashPassword(input.password)),
        createdAt: Timestamp.now(),
    });
}

// Guard against leaving the panel with no one able to manage users
async function assertAnotherAdminRemains(id: string) {
    const admins = (await getAdministrators()).filter(a => a.role === 'admin');
    if (admins.length === 1 && admins[0].id === id) {
        throw new Error('There must be at least one admin');
    }
}

export async function updateAdministratorRole(id: string, role: AdminRole) {
    if (role !== 'admin') await assertAnotherAdminRemains(id);
    await updateDoc(doc(administratorCol, id), { role });
}

export async function deleteAdministrator(id: string) {
    await assertAnotherAdminRemains(id);
    await deleteDoc(doc(administratorCol, id));
}

export interface AdminProfile {
    name: string;
    email: string;
    phoneNumber: string;
    address: string;
    role: AdminRole;
}

export async function getAdministratorProfile(id: string): Promise<AdminProfile | null> {
    const snapshot = await getDoc(doc(administratorCol, id));
    if (!snapshot.exists()) return null;
    const data = snapshot.data();
    return {
        name: data.name ?? '',
        email: data.email ?? '',
        phoneNumber: data.phoneNumber ?? '',
        address: data.address ?? '',
        role: normalizeRole(data.role),
    };
}

// Email and role are deliberately not editable here
export async function updateAdministratorProfile(
    id: string,
    profile: { name: string; phoneNumber: string; address: string }
) {
    await updateDoc(doc(administratorCol, id), {
        name: profile.name.trim(),
        phoneNumber: profile.phoneNumber.trim(),
        address: profile.address.trim(),
        updatedAt: Timestamp.now(),
    });
}

export async function changeAdministratorPassword(id: string, currentPassword: string, newPassword: string) {
    const ref = doc(administratorCol, id);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) throw new Error('Account not found');

    if (!(await verifyPassword(snapshot.data(), currentPassword))) {
        throw new Error('Current password is incorrect');
    }

    // Store the new password hashed and drop any old plain-text copy
    await updateDoc(ref, {
        ...(await hashPassword(newPassword)),
        password: deleteField(),
        updatedAt: Timestamp.now(),
    });
}
