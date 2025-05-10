import { db } from '@/firebase/clientApp'
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore'


export function getPharmacyId(): string {
    if (typeof window === 'undefined') return ''; // SSR guard
    const value = `; ${document.cookie}`;
    const parts = value.split(`; pharmacyId=`);
    if (parts.length === 2) return parts.pop()!.split(';').shift()!;
    return '';
}


export async function POST(request: Request) {
    const { email, password } = await request.json()

    try {
        // Query the Pharmacies collection
        const pharmaciesRef = collection(db, 'Pharmacies')
        const q = query(pharmaciesRef, where('email', '==', email))
        const querySnapshot = await getDocs(q)

        if (querySnapshot.empty) {
            return new Response(JSON.stringify({
                success: false,
                message: 'No pharmacy found with this email'
            }), { status: 401 })
        }

        const pharmacyDoc = querySnapshot.docs[0]
        const pharmacyData = pharmacyDoc.data()

        // Compare passwords (in production, use proper password hashing!)
        if (pharmacyData.password !== password) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Invalid password'
            }), { status: 401 })
        }

        return new Response(JSON.stringify({
            success: true,
            pharmacyId: pharmacyDoc.id,
            pharmacyName: pharmacyData.name
        }), { status: 200 })

    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            message: 'Internal server error'
        }), { status: 500 })
    }
}