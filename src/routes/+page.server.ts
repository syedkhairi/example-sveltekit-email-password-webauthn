import { fail, redirect } from "@sveltejs/kit";
import { deleteSessionTokenCookie, invalidateSession } from "$lib/server/auth/session";
import { get2FARedirect } from "$lib/server/auth/2fa";

import type { Actions, PageServerLoadEvent, RequestEvent } from "./$types";

export function load(event: PageServerLoadEvent) {
	if (event.locals.session === null || event.locals.user === null) {
		return redirect(302, "/login");
	}
	if (!event.locals.user.emailVerified) {
		return redirect(302, "/verify-email");
	}
	if (!event.locals.user.registered2FA) {
		return redirect(302, "/settings/authentication/setup");
	}
	if (!event.locals.session.twoFactorVerified) {
		console.log("Session 2FA not verified");
		return redirect(302, get2FARedirect(event.locals.user));
	}
	return redirect(302, "/feeds");
}

export const actions: Actions = {
	default: action
};

async function action(event: RequestEvent) {
	if (event.locals.session === null) {
		return fail(401, {
			message: "Not authenticated"
		});
	}
	await invalidateSession(event.locals.session.id);
	deleteSessionTokenCookie(event);
	return redirect(302, "/login");
}
