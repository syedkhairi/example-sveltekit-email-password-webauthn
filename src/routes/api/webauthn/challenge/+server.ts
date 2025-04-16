import { createWebAuthnChallenge } from "$lib/server/auth/webauthn";
import { encodeBase64 } from "@oslojs/encoding";
import { RefillingTokenBucket } from "$lib/server/rate-limit";

import type { RequestEvent } from "./$types";

const webauthnChallengeRateLimitBucket = new RefillingTokenBucket<string>(30, 10);

export async function POST(event: RequestEvent) {
	// Get client IP from various possible headers or connection info
    const clientIP = 
        event.request.headers.get("X-Forwarded-For")?.split(',')[0] || // First IP in X-Forwarded-For
        event.request.headers.get("CF-Connecting-IP") || // Cloudflare
        event.request.headers.get("True-Client-IP") || // Akamai and others
        event.getClientAddress() || // SvelteKit's built-in method
        "unknown-ip"; // Fallback value
    if (!webauthnChallengeRateLimitBucket.consume(clientIP, 1)) {
        return new Response("Too many requests", {
            status: 429
        });
    }
	const challenge = createWebAuthnChallenge();
	return new Response(JSON.stringify({ challenge: encodeBase64(challenge) }));
}
