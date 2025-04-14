import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { profileFormSchema } from './profile-form.svelte';
import { zod } from 'sveltekit-superforms/adapters';

export const load = (async ({ parent }) => {
    const { user } = await parent();
    return {
        form: await superValidate({
            username: user.username
        }, zod(profileFormSchema), {
            errors: false
        })
    };
}) satisfies PageServerLoad;