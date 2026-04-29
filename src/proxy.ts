import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function base64UrlToUint8Array(base64url: string) {
  // Convert from base64url to base64
  base64url = base64url.replace(/-/g, "+").replace(/_/g, "/");
  // Pad with '='
  const pad = base64url.length % 4;
  if (pad === 2) base64url += "==";
  else if (pad === 3) base64url += "=";

  const binary = typeof atob === "function"
    ? atob(base64url)
    : Buffer.from(base64url, "base64").toString("binary");

  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function verifyHS256(token: string, secret: string) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [headerB64, payloadB64, signatureB64] = parts;

  const signingInput = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
  const signature = base64UrlToUint8Array(signatureB64);

  const keyData = new TextEncoder().encode(secret);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const valid = await crypto.subtle.verify(
    "HMAC",
    cryptoKey,
    signature,
    signingInput
  );

  if (!valid) return null;

  // Decode payload
  const payloadBytes = base64UrlToUint8Array(payloadB64);
  const payloadJson = typeof TextDecoder !== "undefined"
    ? new TextDecoder().decode(payloadBytes)
    : Buffer.from(payloadBytes).toString("utf8");

  try {
    const payload = JSON.parse(payloadJson);
    // Check expiration if present
    if (payload.exp && typeof payload.exp === "number") {
      const now = Math.floor(Date.now() / 1000);
      if (now >= payload.exp) return null;
    }
    return payload;
  } catch (e) {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) return NextResponse.redirect(new URL("/login", req.url));

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) return NextResponse.redirect(new URL("/login", req.url));

    const decoded = await verifyHS256(token, secret);
    if (!decoded) return NextResponse.redirect(new URL("/login", req.url));

    return NextResponse.next();
  } catch (err) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/employee/:path*", "/owner/:path*"],
};
