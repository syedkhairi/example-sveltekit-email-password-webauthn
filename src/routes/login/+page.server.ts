import { fail, redirect } from "@sveltejs/kit";
import { verifyEmailInput } from "$lib/server/auth/email";
import { getUserFromEmail, getUserPasswordHash } from "$lib/server/auth/user";
import { RefillingTokenBucket, Throttler } from "$lib/server/rate-limit";
import { verifyPasswordHash } from "$lib/server/auth/password";
import { createSession, generateSessionToken, setSessionTokenCookie } from "$lib/server/auth/session";
import { get2FARedirect } from "$lib/server/auth/2fa";

import type { SessionFlags } from "$lib/server/auth/session";
import type { Actions, PageServerLoadEvent, RequestEvent } from "./$types";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { loginFormSchema } from "./login-form.svelte";

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
		form: await superValidate(zod(loginFormSchema))
	};
});

const throttler = new Throttler<number>([0, 1, 2, 4, 8, 16, 30, 60, 180, 300]);
const ipBucket = new RefillingTokenBucket<string>(20, 1);

export const actions: Actions = {
	default: action
};

async function action(event: RequestEvent) {
	const form = await superValidate(event.request, zod(loginFormSchema));

	if (!form.valid) return fail(400, { form });

	// TODO: Assumes X-Forwarded-For is always included.
	const clientIP = event.request.headers.get("X-Forwarded-For");
	if (clientIP !== null && !ipBucket.check(clientIP, 1)) {
		return fail(429, {
			form,
			message: "Too many requests",
			email: ""
		});
	}

	const { data: formData } = form;
	const email = formData.email;
	const password = formData.password;
	if (typeof email !== "string" || typeof password !== "string") {
		return fail(400, {
			form,
			message: "Invalid or missing fields",
			email: ""
		});
	}
	if (email === "" || password === "") {
		return fail(400, {
			form,
			message: "Please enter your email and password.",
			email
		});
	}
	if (!verifyEmailInput(email)) {
		return fail(400, {
			form,
			message: "Invalid email",
			email
		});
	}
	const user = await getUserFromEmail(email);
	if (user === null) {
		return fail(400, {
			form,
			message: "Account does not exist",
			email
		});
	}
	if (clientIP !== null && !ipBucket.consume(clientIP, 1)) {
		return fail(429, {
			form,
			message: "Too many requests",
			email: ""
		});
	}
	if (!throttler.consume(user.id)) {
		return fail(429, {
			form,
			message: "Too many requests",
			email: ""
		});
	}
	const passwordHash = await getUserPasswordHash(user.id);
	const validPassword = await verifyPasswordHash(passwordHash, password);
	if (!validPassword) {
		return fail(400, {
			form,
			message: "Invalid password",
			email
		});
	}
	throttler.reset(user.id);
	const sessionFlags: SessionFlags = {
		twoFactorVerified: false
	};
	const sessionToken = generateSessionToken();
	const session = await createSession(sessionToken, user.id, sessionFlags);
	setSessionTokenCookie(event, sessionToken, session.expiresAt);

	if (!user.emailVerified) {
		console.log("User email not verified");
		return redirect(302, "/verify-email");
	}
	if (!user.registered2FA) {
		console.log("User 2FA not registered");
		return redirect(302, "/settings/authentication/setup");
	}
	console.log("User 2FA not verified");
	return redirect(302, get2FARedirect(user));
}
