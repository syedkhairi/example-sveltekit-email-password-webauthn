import { message, superValidate } from 'sveltekit-superforms';
import type { PageServerLoad, Actions, RequestEvent } from './$types';
import { profileFormSchema } from './profile-form.svelte';
import { zod } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import { updateNameAndUsername } from '$lib/server/auth/user';

export const load = (async ({ parent }) => {
    const { user } = await parent();
    return {
        form: await superValidate({
            name: user.name,
            username: user.username
        }, zod(profileFormSchema), {
            errors: false
        })
    };
}) satisfies PageServerLoad;

export const actions: Actions = {
    update_name_username: updateNameUsernameAction,
};

async function updateNameUsernameAction(event: RequestEvent) {
    const form = await superValidate(event.request, zod(profileFormSchema));

    if (!form.valid) return fail(400, { form });

    if (event.locals.session === null || event.locals.user === null) {
        return fail(401, {
            form,
            message: "Not authenticated"
        });
    }
    if (event.locals.user.registered2FA && !event.locals.session.twoFactorVerified) {
        return fail(403, {
            form,
            message: "Forbidden"
        });
    }

    const { data: formData } = form;
    const name = formData.name;
    const username = formData.username;
    console.log(name)
    const result = await updateNameAndUsername(event.locals.user.id, name, username);
    if (result) {
        message(form, {
            message: "Your profile updated"
        })
    }
    return { form }
}