import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const SECRET_KEY = process.env.ROLE_SALT_KEY || 'maintainiq-secure-role-salt-key-32-chars';

/**
 * Encrypt a role string using AES-256-CBC and the ROLE_SALT_KEY env variable
 */
export function encryptRole(role: string): string {
  // Generate a key of exactly 32 bytes from the secret salt key
  const key = crypto.scryptSync(SECRET_KEY, 'maintainiq-salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(role, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Return IV along with encrypted payload to allow decryption
  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt an encrypted role string back into clear text ('admin', 'technician', etc.)
 */
export function decryptRole(encryptedRole: string): string {
  if (!encryptedRole || !encryptedRole.includes(':')) {
    return encryptedRole || 'client';
  }

  try {
    const parts = encryptedRole.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = Buffer.from(parts[1], 'hex');
    
    const key = crypto.scryptSync(SECRET_KEY, 'maintainiq-salt', 32);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString('utf8');
  } catch (err) {
    // If decryption fails (e.g. invalid key/tampered data), fall back to lowest privilege role
    return 'client';
  }
}
