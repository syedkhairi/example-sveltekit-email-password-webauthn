import { verifyEmailInput } from "$lib/server/auth/email";
import { getUserFromEmail } from "$lib/server/auth/user";
import {
	createPasswordResetSession,
	invalidateUserPasswordResetSessions,
	sendPasswordResetEmail,
	setPasswordResetSessionTokenCookie
} from "$lib/server/auth/password-reset";
import { RefillingTokenBucket } from "$lib/server/rate-limit";
import { generateSessionToken } from "$lib/server/auth/session";
import { fail, redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { forgotPasswordFormSchema } from "./forgot-password.svelte";

import type { Actions, RequestEvent, PageServerLoadEvent } from "./$types";

const ipBucket = new RefillingTokenBucket<string>(3, 60);
const userBucket = new RefillingTokenBucket<number>(3, 60);

export const load = (async () => {
	return {
		form: await superValidate(zod(forgotPasswordFormSchema)),
	};
});

export const actions: Actions = {
	default: action
};

async function action(event: RequestEvent) {
	const form = await superValidate(event.request, zod(forgotPasswordFormSchema));

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
	if (typeof email !== "string") {
		return fail(400, {
			form,
			message: "Invalid or missing fields",
			email: ""
		});
	}
	if (!verifyEmailInput(email)) {
		return fail(400, {
			form,
			message: "Invalid email",
			email
		});
	}
	const user = await  getUserFromEmail(email);
	if (user === null) {
		return fail(400, {
			form,
			message: "Account does not exist",
			email
		});
	}
	if (clientIP !== null && !ipBucket.consume(clientIP, 1)) {
		return fail(400, {
			form,
			message: "Too many requests",
			email
		});
	}
	if (!userBucket.consume(user.id, 1)) {
		return fail(400, {
			form,
			message: "Too many requests",
			email
		});
	}
	invalidateUserPasswordResetSessions(user.id);
	const sessionToken = generateSessionToken();
	const session = await createPasswordResetSession(sessionToken, user.id, user.email);
	sendPasswordResetEmail(session.email, session.code);
	setPasswordResetSessionTokenCookie(event, sessionToken, session.expiresAt);
	return redirect(302, "/reset-password/verify-email");
}
