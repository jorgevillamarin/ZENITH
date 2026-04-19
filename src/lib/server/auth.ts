const SALT_ROUNDS = 10;

const encoder = new TextEncoder();
const cryptoKey = crypto.subtle.importKey(
    'raw',
    encoder.encode('zenith-secret-key-change-in-production'),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
);

export async function hashPassword(password: string): Promise<string> {
    const key = await cryptoKey;
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const derivedKey = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
        key,
        256
    );
    
    const saltBase64 = btoa(String.fromCharCode(...salt));
    const hashBase64 = btoa(String.fromCharCode(...new Uint8Array(derivedKey)));
    
    return `${saltBase64}:${hashBase64}`;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    const [saltBase64, hashBase64] = hash.split(':');
    const salt = Uint8Array.from(atob(saltBase64), c => c.charCodeAt(0));
    const storedHash = Uint8Array.from(atob(hashBase64), c => c.charCodeAt(0));
    
    const key = await cryptoKey;
    const derivedKey = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
        key,
        256
    );
    
    return btoa(String.fromCharCode(...storedHash)) === btoa(String.fromCharCode(...new Uint8Array(derivedKey)));
}

export function generateSecureId(): string {
    return crypto.randomUUID();
}