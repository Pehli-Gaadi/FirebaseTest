import CryptoJS from 'crypto-js';
import Cookies from 'js-cookie';

const secretKey = import.meta.env.VITE_CRYTPO_SECRET;

console.log('secretKey', secretKey);

// 🔐 Encrypt data
const encryptData = (data) => {
  try {
    const encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(data), secretKey).toString();
    return encrypted;
  } catch (err) {
    console.error('[EncryptData] Error:', err.message);
    return null;
  }
};

// 🔓 Decrypt data
const decryptData = (ciphertext) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) throw new Error('Decryption failed');
    return decrypted;
  } catch (err) {
    console.error('[DecryptData] Error:', err.message);
    return null;
  }
};

// ✅ Set encrypted JWT tokens in cookies with expiry
export const setTokens = (accessToken, refreshToken) => {

  const encryptedAccessToken = encryptData(accessToken);
  const encryptedRefreshToken = encryptData(refreshToken);

  const accessExpiry = 30;
  const refreshExpiry = 90;

  if (encryptedAccessToken && encryptedRefreshToken) {
    Cookies.set('accessToken', encryptedAccessToken, { expires: accessExpiry, path: '/' });
    Cookies.set('refreshToken', encryptedRefreshToken, { expires: refreshExpiry, path: '/' });
  } else {
    console.warn('[setTokens] Failed to encrypt tokens. Nothing stored.');
  }
};

// ✅ Get decrypted JWT tokens from cookies
export const getTokens = () => {
  const encryptedAccessToken = Cookies.get('accessToken');
  const encryptedRefreshToken = Cookies.get('refreshToken');

  if (!encryptedAccessToken || !encryptedRefreshToken) {
    console.warn('[getTokens] No tokens found in cookies.');
  }

  const accessToken = encryptedAccessToken ? decryptData(encryptedAccessToken) : null;
  const refreshToken = encryptedRefreshToken ? decryptData(encryptedRefreshToken) : null;

  return { accessToken, refreshToken };
};

// ❌ Remove tokens from cookies
export const removeTokens = () => {
  Cookies.remove('accessToken', { path: '/' });
  Cookies.remove('refreshToken', { path: '/' });
  console.log('[removeTokens] Tokens removed from cookies.');
};
