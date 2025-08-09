import crypto from "crypto";
import sodium from "libsodium-wrappers";

const JWKS_URL = "https://rest.alpha.fal.ai/.well-known/jwks.json";
const JWKS_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours (milliseconds)

interface JWKSKey {
  x: string;
  kty: string;
  crv: string;
}

interface JWKSResponse {
  keys: JWKSKey[];
}

// JWKS cache
let jwksCache: JWKSKey[] | null = null;
let jwksCacheTime = 0;

/**
 * Get JWKS (JSON Web Key Set)
 */
async function fetchJwks(): Promise<JWKSKey[]> {
  const currentTime = Date.now();

  // Check if cache is valid
  if (!jwksCache || currentTime - jwksCacheTime > JWKS_CACHE_DURATION) {
    try {
      const response = await fetch(JWKS_URL, {
        signal: AbortSignal.timeout(10000), // 10 seconds timeout
      });

      if (!response.ok) {
        throw new Error(`JWKS fetch failed: ${response.status}`);
      }

      const jwksData: JWKSResponse = await response.json();
      jwksCache = jwksData.keys || [];
      jwksCacheTime = currentTime;

      console.log(`JWKS cache updated with ${jwksCache.length} keys`);
    } catch (error) {
      console.error("Error getting JWKS:", error);
      throw error;
    }
  }

  return jwksCache;
}

/**
 * Verify webhook signature
 */
export async function verifyWebhookSignature(
  requestId: string,
  userId: string,
  timestamp: string,
  signatureHex: string,
  body: Buffer
): Promise<boolean> {
  try {
    // Initialize libsodium
    await sodium.ready;

    // Verify timestamp (allow ±5 minutes deviation)
    const timestampInt = parseInt(timestamp, 10);
    if (isNaN(timestampInt)) {
      console.error("Invalid timestamp format");
      return false;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const timeDiff = Math.abs(currentTime - timestampInt);

    if (timeDiff > 300) {
      // 5 minutes = 300 seconds
      console.error(`Timestamp expired, time difference: ${timeDiff} seconds`);
      return false;
    }

    // Construct message to verify
    const messageParts = [
      requestId,
      userId,
      timestamp,
      crypto.createHash("sha256").update(body).digest("hex"),
    ];

    // Check for missing header values
    if (messageParts.some((part) => part == null || part === "")) {
      console.error("Missing required header values");
      return false;
    }

    const messageToVerify = messageParts.join("\n");
    const messageBytes = Buffer.from(messageToVerify, "utf-8");

    // Decode signature
    let signatureBytes: Buffer;
    try {
      signatureBytes = Buffer.from(signatureHex, "hex");
    } catch (error) {
      console.error("Invalid signature format (not hexadecimal):", error);
      return false;
    }

    // Get public keys
    let publicKeysInfo: JWKSKey[];
    try {
      publicKeysInfo = await fetchJwks();
      if (!publicKeysInfo.length) {
        console.error("No public keys found in JWKS");
        return false;
      }
    } catch (error) {
      console.error("Error getting JWKS:", error);
      return false;
    }

    // Verify signature with each public key
    for (const keyInfo of publicKeysInfo) {
      try {
        const publicKeyB64Url = keyInfo.x;
        if (typeof publicKeyB64Url !== "string") {
          continue;
        }

        // Decode public key from base64url
        const publicKeyBytes = Buffer.from(publicKeyB64Url, "base64url");

        // Verify signature using ED25519
        const isValid = sodium.crypto_sign_verify_detached(
          signatureBytes,
          messageBytes,
          publicKeyBytes
        );

        if (isValid) {
          console.log("Signature verification successful");
          return true;
        }
      } catch (error) {
        console.error("Verification failed with one key:", error);
        continue;
      }
    }

    console.error("Signature verification failed with all keys");
    return false;
  } catch (error) {
    console.error("Error constructing message:", error);
    return false;
  }
}

/**
 * Extract verification information from request headers
 */
export function extractWebhookHeaders(headers: Headers) {
  const requestId = headers.get("x-fal-webhook-request-id");
  const userId = headers.get("x-fal-webhook-user-id");
  const timestamp = headers.get("x-fal-webhook-timestamp");
  const signature = headers.get("x-fal-webhook-signature");

  return {
    requestId,
    userId,
    timestamp,
    signature,
    isValid: !!(requestId && userId && timestamp && signature),
  };
}
