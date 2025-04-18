import { fail, redirect } from "@sveltejs/kit";
import { checkEmailAvailability, verifyEmailInput } from "$lib/server/auth/email";
import { createUser, verifyUsernameInput } from "$lib/server/auth/user";
import { RefillingTokenBucket } from "$lib/server/rate-limit";
import { verifyPasswordStrength } from "$lib/server/auth/password";
import { createSession, generateSessionToken, setSessionTokenCookie } from "$lib/server/auth/session";
import {
	createEmailVerificationRequest,
	sendVerificationEmail,
	setEmailVerificationRequestCookie
} from "$lib/server/auth/email-verification";
import { get2FARedirect } from "$lib/server/auth/2fa";
import { registerFormSchema } from "./signup-form.svelte";
import { zod } from "sveltekit-superforms/adapters";
import { superValidate } from "sveltekit-superforms";

import type { SessionFlags } from "$lib/server/auth/session";
import type { Actions, PageServerLoadEvent, RequestEvent } from "./$types";

const ipBucket = new RefillingTokenBucket<string>(3, 10);

export const load = (async (event: PageServerLoadEvent) => {
	if (event.locals.session !== null && event.locals.user !== null) {
		if (!event.locals.user.emailVerified) {
			return redirect(302, "/verify-email");
		}
		if (!event.locals.user.registered2FA) {
			return redirect(302, "/settings/authentication/setup");
		}
		if (!event.locals.session.twoFactorVerified) {
			return redirect(302, get2FARedirect(event.locals.user));
		}
		return redirect(302, "/");
	}
	return {
		form: await superValidate(zod(registerFormSchema))
	};
});

export const actions: Actions = {
	default: action
};

async function action(event: RequestEvent) {
	const form = await superValidate(event.request, zod(registerFormSchema));

	if (!form.valid) return fail(400, { form });

	// TODO: Assumes X-Forwarded-For is always included.
	const clientIP = event.request.headers.get("X-Forwarded-For");
	if (clientIP !== null && !ipBucket.check(clientIP, 1)) {
		return fail(429, {
			message: "Too many requests",
			email: "",
			name: "",
			username: ""
		});
	}

	const { data: formData } = form
	const email = formData.email;
	const name = formData.name;
	const username = formData.username;
	const password = formData.password;
	if (!verifyEmailInput(email)) {
		return fail(400, {
			message: "Invalid email",
			email,
			username
		});
	}
	const emailAvailable = checkEmailAvailability(email);
	if (!emailAvailable) {
		return fail(400, {
			message: "Email is already used",
			email,
			username
		});
	}
	if (!verifyUsernameInput(username)) {
		return fail(400, {
			message: "Invalid username",
			email,
			username
		});
	}
	const strongPassword = await verifyPasswordStrength(password);
	if (!strongPassword) {
		return fail(400, {
			message: "Weak password",
			email,
			username
		});
	}
	if (clientIP !== null && !ipBucket.consume(clientIP, 1)) {
		return fail(429, {
			message: "Too many requests",
			email,
			username
		});
	}
	const user = await createUser(email, username, password, name);
	const emailVerificationRequest = await createEmailVerificationRequest(user.id, user.email);
	sendVerificationEmail(emailVerificationRequest.email, emailVerificationRequest.code);
	setEmailVerificationRequestCookie(event, emailVerificationRequest);

	const sessionFlags: SessionFlags = {
		twoFactorVerified: false
	};
	const sessionToken = generateSessionToken();
	const session = await createSession(sessionToken, user.id, sessionFlags);
	setSessionTokenCookie(event, sessionToken, session.expiresAt);
	throw redirect(302, "/settings/authentication/setup");
}
