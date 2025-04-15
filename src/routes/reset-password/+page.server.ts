import {
	deletePasswordResetSessionTokenCookie,
	invalidateUserPasswordResetSessions,
	validatePasswordResetSessionRequest
} from "$lib/server/auth/password-reset";
import { fail, redirect } from "@sveltejs/kit";
import { verifyPasswordStrength } from "$lib/server/auth/password";
import {
	createSession,
	generateSessionToken,
	invalidateUserSessions,
	setSessionTokenCookie
} from "$lib/server/auth/session";
import { updateUserPassword } from "$lib/server/auth/user";
import { getPasswordReset2FARedirect } from "$lib/server/auth/2fa";

import type { Actions, RequestEvent } from "./$types";
import type { SessionFlags } from "$lib/server/auth/session";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { formSchema } from "./reset-password-form.svelte";

export const load = (async (event: RequestEvent) => {
	const { session, user } = await validatePasswordResetSessionRequest(event);
	if (session === null) {
		return redirect(302, "/forgot-password");
	}
	if (!session.emailVerified) {
		return redirect(302, "/reset-password/verify-email");
	}
	if (user.registered2FA && !session.twoFactorVerified) {
		return redirect(302, getPasswordReset2FARedirect(user));
	}
	return {
		form: await superValidate(zod(formSchema))
	};
})

export const actions: Actions = {
	default: action
};

async function action(event: RequestEvent) {
	const form = await superValidate(event.request, zod(formSchema));

	if (!form.valid) return fail(400, { form });

	const { session: passwordResetSession, user } = await validatePasswordResetSessionRequest(event);
	if (passwordResetSession === null) {
		return fail(401, {
			form,
			message: "Not authenticated"
		});
	}
	if (!passwordResetSession.emailVerified) {
		return fail(403, {
			form,
			message: "Forbidden"
		});
	}
	if (user.registered2FA && !passwordResetSession.twoFactorVerified) {
		return fail(403, {
			form,
			message: "Forbidden"
		});
	}
	const { data: formData } = form;
	const password = formData.password;
	if (typeof password !== "string") {
		return fail(400, {
			form,
			message: "Invalid or missing fields"
		});
	}

	const strongPassword = await verifyPasswordStrength(password);
	if (!strongPassword) {
		return fail(400, {
			form,
			message: "Weak password"
		});
	}
	invalidateUserPasswordResetSessions(passwordResetSession.userId);
	invalidateUserSessions(passwordResetSession.userId);
	await updateUserPassword(passwordResetSession.userId, password);

	const sessionFlags: SessionFlags = {
		twoFactorVerified: passwordResetSession.twoFactorVerified
	};
	const sessionToken = generateSessionToken();
	const session = await createSession(sessionToken, user.id, sessionFlags);
	setSessionTokenCookie(event, sessionToken, session.expiresAt);
	deletePasswordResetSessionTokenCookie(event);
	return redirect(302, "/");
}
