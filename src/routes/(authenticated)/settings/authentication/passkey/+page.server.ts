import { redirect } from "@sveltejs/kit";
import { get2FARedirect } from "$lib/server/auth/2fa";
import { getUserPasskeyCredentials } from "$lib/server/auth/webauthn";

import type { RequestEvent } from "./$types";

export async function load(event: RequestEvent) {
	console.log("Loading passkey credentials");
	if (event.locals.session === null || event.locals.user === null) {
		console.log("Session or user is null");
		return redirect(302, "/login");
	}
	if (!event.locals.user.emailVerified) {
		console.log("Email not verified");
		return redirect(302, "/verify-email");
	}
	if (!event.locals.user.registered2FA) {
		console.log("2FA not registered");
		return redirect(302, "/");
	}
	if (event.locals.session.twoFactorVerified) {
		console.log("2FA already verified");
		return redirect(302, "/");
	}
	if (!event.locals.user.registeredPasskey) {
		console.log("Passkey not registered");
		return redirect(302, get2FARedirect(event.locals.user));
	}
	const credentials = await getUserPasskeyCredentials(event.locals.user.id);
	return {
		credentials,
		user: event.locals.user
	};
}
