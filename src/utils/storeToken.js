import CryptoJS from 'crypto-js';
import Cookies from 'js-cookie';

const secretKey = import.meta.env.VITE_CRYTPO_SECRET;

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
  try {
    const encryptedAccessToken = encryptData(accessToken);
    const encryptedRefreshToken = refreshToken ? encryptData(refreshToken) : null;

    // Get expiry from JWT token
    const decodedToken = JSON.parse(atob(accessToken.split('.')[1]));
    const expiryDate = new Date(decodedToken.exp * 1000);
    
    // Calculate days until expiry
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

    // Set cookies with proper expiry
    if (encryptedAccessToken) {
      Cookies.set('accessToken', encryptedAccessToken, { expires: daysUntilExpiry, path: '/' });
      if (encryptedRefreshToken) {
        Cookies.set('refreshToken', encryptedRefreshToken, { expires: daysUntilExpiry + 60, path: '/' });
      }
      return { expiryDate };
    }
  } catch (err) {
    console.error('[setTokens] Error:', err.message);
  }
  console.warn('[setTokens] Failed to store tokens.');
  return null;
};

// ✅ Get decrypted JWT tokens from cookies and check expiry
export const getTokens = () => {
  try {
    const encryptedAccessToken = Cookies.get('accessToken');

    if (!encryptedAccessToken) {
      console.warn('[getTokens] No access token found in cookies.');
      return null;
    }

    const accessToken = decryptData(encryptedAccessToken);

    if (!accessToken) {
      console.error('[getTokens] Failed to decrypt access token');
      return null;
    }

    const encryptedRefreshToken = Cookies.get('refreshToken');
    const refreshToken = encryptedRefreshToken ? decryptData(encryptedRefreshToken) : null;

    return { accessToken, refreshToken };
  } catch (error) {
    console.error('[getTokens] Error:', error);
    return null;
  }
};

// ❌ Remove tokens from cookies
export const removeTokens = () => {
  Cookies.remove('accessToken', { path: '/' });
  Cookies.remove('refreshToken', { path: '/' });
  console.log('[removeTokens] Tokens removed from cookies.');
};
