import type { RequestHandler } from './$types';
import { redirect } from "@sveltejs/kit";
import { deleteSessionTokenCookie, invalidateSession } from "$lib/server/session";

export const GET: RequestHandler = async (event) => {
	if (event.locals.session === null) {
		return new Response(JSON.stringify({
			message: "Not authenticated"
		}), {
			status: 401,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}
	invalidateSession(event.locals.session.id);
	deleteSessionTokenCookie(event);
	return redirect(302, "/login");
};