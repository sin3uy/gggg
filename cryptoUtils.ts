
/**
 * أدوات تشفير البيانات باستخدام AES-256-GCM
 * تعمل بالكامل في المتصفح (Offline)
 */

const ITERATIONS = 100000;
const KEY_LEN = 256;
const SALT_LEN = 16;
const IV_LEN = 12;

const enc = new TextEncoder();
const dec = new TextDecoder();

/**
 * تحويل مصفوفة البايتات إلى Base64 بأمان
 */
function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * تحويل Base64 إلى مصفوفة بايتات بأمان
 */
function base64ToBytes(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * اشتقاق مفتاح تشفير من الـ PIN
 */
async function deriveKey(pin: string, salt: Uint8Array): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(pin),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: KEY_LEN },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * تشفير نص باستخدام PIN
 */
export async function encryptData(data: string, pin: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LEN));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LEN));
  const key = await deriveKey(pin, salt);
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(data)
  );

  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  combined.set(salt);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encrypted), salt.length + IV_LEN);

  return bytesToBase64(combined);
}

/**
 * فك تشفير نص باستخدام PIN
 */
export async function decryptData(base64Data: string, pin: string): Promise<string> {
  try {
    const combined = base64ToBytes(base64Data);

    const salt = combined.slice(0, SALT_LEN);
    const iv = combined.slice(SALT_LEN, SALT_LEN + IV_LEN);
    const data = combined.slice(SALT_LEN + IV_LEN);

    const key = await deriveKey(pin, salt);
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    return dec.decode(decrypted);
  } catch (e) {
    throw new Error('رمز فك التشفير خاطئ أو الملف تالف');
  }
}
