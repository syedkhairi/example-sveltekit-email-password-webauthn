import { redirect } from "@sveltejs/kit";
import { getPasswordReset2FARedirect } from "$lib/server/auth/2fa";
import { getUserSecurityKeyCredentials } from "$lib/server/auth/webauthn";
import { validatePasswordResetSessionRequest } from "$lib/server/auth/password-reset";

import type { RequestEvent } from "./$types";

export async function load(event: RequestEvent) {
	const { session, user } = await validatePasswordResetSessionRequest(event);

	if (session === null) {
		return redirect(302, "/forgot-password");
	}
	if (!session.emailVerified) {
		return redirect(302, "/reset-password/verify-email");
	}
	if (!user.registered2FA) {
		return redirect(302, "/reset-password");
	}
	if (session.twoFactorVerified) {
		return redirect(302, "/reset-password");
	}
	if (!user.registeredSecurityKey) {
		return redirect(302, getPasswordReset2FARedirect(user));
	}
	const credentials = await getUserSecurityKeyCredentials(user.id);
	return {
		credentials,
		user
	};
}
