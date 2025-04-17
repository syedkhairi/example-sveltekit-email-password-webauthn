import type { PageServerLoad } from './$types';

export const load = (async () => {
    const response = await fetch('https://dummyjson.com/comments');
    const data = await response.json();
    return {
        posts: data.comments
    };
}) satisfies PageServerLoad;