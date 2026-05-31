// src/lib/auth.js

const JWT_SECRET = process.env.JWT_SECRET || "prime-property-super-secret-key-1234567890-secure!";

// Helper to convert string to Uint8Array and import as Web Crypto HMAC key
async function getSecretKey() {
  const enc = new TextEncoder();
  return await crypto.subtle.importKey(
    "raw",
    enc.encode(JWT_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

// Custom base64url encoding helpers to avoid external dependencies
function base64urlEncode(str) {
  return btoa(str)
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64urlDecode(str) {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return atob(base64);
}

/**
 * Signs a JWT payload using HS256 algorithm
 * @param {Object} payload - Data to encode in the token
 * @param {number} [expiresInDays=30] - Expiration duration in days
 * @returns {Promise<string>} Signed JWT
 */
export async function signJWT(payload, expiresInDays = 30) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const exp = now + expiresInDays * 24 * 60 * 60;
  
  const fullPayload = {
    ...payload,
    iat: now,
    exp,
  };

  const encodedHeader = base64urlEncode(JSON.stringify(header));
  const encodedPayload = base64urlEncode(JSON.stringify(fullPayload));
  const tokenInput = `${encodedHeader}.${encodedPayload}`;
  
  const key = await getSecretKey();
  const enc = new TextEncoder();
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode(tokenInput)
  );

  const signatureArray = new Uint8Array(signature);
  let signatureBin = "";
  for (let i = 0; i < signatureArray.length; i++) {
    signatureBin += String.fromCharCode(signatureArray[i]);
  }
  const encodedSignature = base64urlEncode(signatureBin);

  return `${tokenInput}.${encodedSignature}`;
}

/**
 * Verifies a JWT and returns its payload if valid
 * @param {string} token - The JWT token to verify
 * @returns {Promise<Object|null>} Decoded payload or null if invalid/expired
 */
export async function verifyJWT(token) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const tokenInput = `${encodedHeader}.${encodedPayload}`;

  try {
    const key = await getSecretKey();
    const enc = new TextEncoder();
    
    // Decode signature
    const signatureBin = base64urlDecode(encodedSignature);
    const signatureBytes = new Uint8Array(signatureBin.length);
    for (let i = 0; i < signatureBin.length; i++) {
      signatureBytes[i] = signatureBin.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      enc.encode(tokenInput)
    );

    if (!isValid) return null;

    // Decode payload
    const payloadStr = base64urlDecode(encodedPayload);
    const payload = JSON.parse(payloadStr);

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && now > payload.exp) {
      return null; // Token has expired
    }

    return payload;
  } catch (error) {
    console.error("JWT Verification error:", error);
    return null;
  }
}
