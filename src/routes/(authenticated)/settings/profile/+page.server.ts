import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { profileFormSchema } from './profile-form.svelte';
import { zod } from 'sveltekit-superforms/adapters';

export const load = (async () => {
    return {
        form: await superValidate(zod(profileFormSchema))
    };
}) satisfies PageServerLoad;