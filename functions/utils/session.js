async function getCryptoKey(secret) {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function utf8ToBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

function base64ToUtf8(str) {
  return decodeURIComponent(escape(atob(str)));
}

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function createSessionCookie(payload, secret) {
  const enc = new TextEncoder();
  
  // Set expiration (default 24h)
  payload.exp = Math.floor(Date.now() / 1000) + 86400;
  
  const valueBase64 = utf8ToBase64(JSON.stringify(payload));
  
  const key = await getCryptoKey(secret);
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(valueBase64));
  const signatureBase64 = arrayBufferToBase64(signatureBuffer);
  
  // Format: value.signature
  const token = `${valueBase64}.${signatureBase64}`;
  
  // Create Set-Cookie header
  return `erm_session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=86400`;
}

export async function verifySessionCookie(cookieHeader, secret) {
  if (!cookieHeader) return null;
  
  const match = cookieHeader.match(/erm_session=([^;]+)/);
  if (!match) return null;
  
  const token = match[1];
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  
  const [valueBase64, signatureBase64] = parts;
  
  const key = await getCryptoKey(secret);
  const enc = new TextEncoder();
  
  // Verify signature
  const signatureBuffer = Uint8Array.from(atob(signatureBase64), c => c.charCodeAt(0));
  const isValid = await crypto.subtle.verify(
    'HMAC',
    key,
    signatureBuffer,
    enc.encode(valueBase64)
  );
  
  if (!isValid) return null;
  
  try {
    const payload = JSON.parse(base64ToUtf8(valueBase64));
    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch (e) {
    return null;
  }
}
