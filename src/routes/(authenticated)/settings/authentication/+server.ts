import { get2FARedirect } from "$lib/server/auth/2fa";

import type { RequestEvent } from "./$types";

export function GET(event: RequestEvent): Response {
	if (event.locals.session === null || event.locals.user === null) {
		return new Response(null, {
			status: 302,
			headers: {
				Location: "/login"
			}
		});
	}
	if (event.locals.session.twoFactorVerified) {
		return new Response(null, {
			status: 302,
			headers: {
				Location: "/"
			}
		});
	}
	if (!event.locals.user.registered2FA) {
		return new Response(null, {
			status: 302,
			headers: {
				Location: "/settings/authentication/setup"
			}
		});
	}
	return new Response(null, {
		status: 302,
		headers: {
			Location: get2FARedirect(event.locals.user)
		}
	});
}