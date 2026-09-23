'use client'
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/clientApp';
import { getPharmacyId } from '@/server/auth';
import { AdminRole, ROLE_COOKIE, getRoleFromCookie, normalizeRole } from './roles';

// Returns the signed-in admin's role, or null until it is known (keeps SSR
// and first client render identical). The cookie gives a fast answer; the
// Administrator document is then checked so an edited cookie can't grant
// more access than the account has.
export function useRole(): AdminRole | null {
    const [role, setRole] = useState<AdminRole | null>(null);

    useEffect(() => {
        const cookieRole = getRoleFromCookie();
        setRole(cookieRole);

        const adminId = getPharmacyId();
        if (!adminId) return;

        getDoc(doc(db, 'Administrator', adminId))
            .then(snapshot => {
                if (!snapshot.exists()) return;
                const actualRole = normalizeRole(snapshot.data().role);
                if (actualRole !== cookieRole) {
                    document.cookie = `${ROLE_COOKIE}=${actualRole};path=/;max-age=${7 * 24 * 60 * 60}`;
                    // Reload so middleware re-evaluates the route with the real role
                    window.location.reload();
                }
            })
            .catch(error => console.error('Error verifying admin role:', error));
    }, []);

    return role;
}
