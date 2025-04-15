import { createTOTPKeyURI, verifyTOTP } from "@oslojs/otp";
import { fail, redirect } from "@sveltejs/kit";
import { decodeBase64, encodeBase64 } from "@oslojs/encoding";
import { totpUpdateBucket, updateUserTOTPKey } from "$lib/server/auth/totp";
import { setSessionAs2FAVerified } from "$lib/server/auth/session";
import { renderSVG } from "uqr";
import { get2FARedirect } from "$lib/server/auth/2fa";

import type { Actions, RequestEvent } from "./$types";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { formSchema } from "./+page.svelte"

export async function load(event: RequestEvent) {
	if (event.locals.session === null || event.locals.user === null) {
		return redirect(302, "/login");
	}
	if (!event.locals.user.emailVerified) {
		return redirect(302, "/verify-email");
	}
	if (event.locals.user.registered2FA && !event.locals.session.twoFactorVerified) {
		return redirect(302, get2FARedirect(event.locals.user));
	}

	const totpKey = new Uint8Array(20);
	crypto.getRandomValues(totpKey);
	const encodedTOTPKey = encodeBase64(totpKey);
	const keyURI = createTOTPKeyURI("Demo", event.locals.user.username, totpKey, 30, 6);
	const qrcode = renderSVG(keyURI);
	return {
		form: await superValidate({
			encodedTOTPKey,
		}, zod(formSchema), {
			errors: false
		}),
		qrcode: qrcode,
	};
}

export const actions: Actions = {
	default: action
};

async function action(event: RequestEvent) {
	const form = await superValidate(event.request, zod(formSchema));

	if (!form.valid) return fail(400, { form });
	
	if (event.locals.session === null || event.locals.user === null) {
		return fail(401, {
			form,
			message: "Not authenticated"
		});
	}
	if (!event.locals.user.emailVerified) {
		return fail(403, {
			form,
			message: "Forbidden"
		});
	}
	if (event.locals.user.registered2FA && !event.locals.session.twoFactorVerified) {
		return fail(403, {
			form,
			message: "Forbidden"
		});
	}
	if (!totpUpdateBucket.check(event.locals.user.id, 1)) {
		return fail(429, {
			form,
			message: "Too many requests"
		});
	}

	const { data: formData } = form;
	const encodedKey = formData.encodedTOTPKey;
	const code = formData.pin;
	if (typeof encodedKey !== "string" || typeof code !== "string") {
		return fail(400, {
			form,
			message: "Invalid or missing fields"
		});
	}
	if (code === "") {
		return fail(400, {
			form,
			message: "Please enter your code"
		});
	}
	if (encodedKey.length !== 28) {
		return fail(400, {
			form,
			message: "Please enter your code"
		});
	}
	let key: Uint8Array;
	try {
		key = decodeBase64(encodedKey);
	} catch {
		return fail(400, {
			form,
			message: "Invalid key"
		});
	}
	if (key.byteLength !== 20) {
		return fail(400, {
			form,
			message: "Invalid key"
		});
	}
	if (!totpUpdateBucket.consume(event.locals.user.id, 1)) {
		return fail(429, {
			form,
			message: "Too many requests"
		});
	}
	if (!verifyTOTP(key, 30, 6, code)) {
		return fail(400, {
			form,
			message: "Invalid code"
		});
	}
	await updateUserTOTPKey(event.locals.session.userId, key);
	await setSessionAs2FAVerified(event.locals.session.id);
	if (!event.locals.user.registered2FA) {
		return redirect(302, "/recovery-code");
	}
	return redirect(302, "/");
}
