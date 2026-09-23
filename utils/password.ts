// Password hashing for Administrator accounts using the browser's Web Crypto
// PBKDF2, so new accounts never store the plain password.
const ITERATIONS = 100_000;

const toHex = (buffer: ArrayBuffer | Uint8Array) =>
    Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');

const fromHex = (hex: string) =>
    new Uint8Array((hex.match(/.{2}/g) ?? []).map(byte => parseInt(byte, 16)));

async function derive(password: string, salt: Uint8Array): Promise<string> {
    const key = await crypto.subtle.importKey(
        'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']
    );
    const bits = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations: ITERATIONS },
        key,
        256
    );
    return toHex(bits);
}

export async function hashPassword(password: string) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    return { passwordHash: await derive(password, salt), passwordSalt: toHex(salt) };
}

// Accepts hashed accounts and older ones that still store `password` in plain text
export async function verifyPassword(
    stored: { password?: string; passwordHash?: string; passwordSalt?: string },
    password: string
): Promise<boolean> {
    if (stored.passwordHash && stored.passwordSalt) {
        return (await derive(password, fromHex(stored.passwordSalt))) === stored.passwordHash;
    }
    return stored.password !== undefined && stored.password === password;
}
