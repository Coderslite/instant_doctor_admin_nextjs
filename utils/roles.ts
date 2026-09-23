// Roles for admin panel users. The role is read from the `role` field on the
// Administrator document; documents without one are treated as full admins.
export type AdminRole = 'admin' | 'marketer';

export const ROLE_COOKIE = 'adminRole';

export const ROLE_OPTIONS: { value: AdminRole; label: string; description: string }[] = [
    { value: 'admin', label: 'Admin', description: 'Full access, including finances and user management' },
    { value: 'marketer', label: 'Marketer', description: 'Dashboard counts, masked user lists and restricted patient profiles, newsletter, individual emails, notifications and health tips' },
];

// Routes a marketer may open. Exact entries match that path only (so list
// pages are allowed but /users/doctors/[id] detail pages are not); entries
// ending in "/*" also allow every sub-path.
const MARKETER_ROUTES = [
    '/',
    '/users/patients',
    '/users/patients/*', // restricted profile view; page hides sensitive sections
    '/users/doctors',
    '/notification',
    '/newsletter',
    '/mail',
    '/healthtips',
    '/healthtips/*',
    '/profile',
];

export function normalizeRole(value: unknown): AdminRole {
    return value === 'marketer' ? 'marketer' : 'admin';
}

export function canAccess(role: AdminRole | null, pathname: string): boolean {
    if (role !== 'marketer') return true;
    const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
    return MARKETER_ROUTES.some(route =>
        route.endsWith('/*')
            ? path.startsWith(route.slice(0, -1))
            : path === route
    );
}

// Client-side cookie read; returns null during SSR
export function getRoleFromCookie(): AdminRole | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp(`(?:^|; )${ROLE_COOKIE}=([^;]*)`));
    return normalizeRole(match?.[1]);
}

export function maskEmail(email?: string): string {
    if (!email) return '';
    const [name, domain] = email.split('@');
    if (!domain) return '••••••';
    return `${name.slice(0, 2)}•••@${domain}`;
}

export function maskPhone(phone?: string): string {
    if (!phone) return '';
    return phone.length <= 4 ? '••••' : `••••••${phone.slice(-3)}`;
}
