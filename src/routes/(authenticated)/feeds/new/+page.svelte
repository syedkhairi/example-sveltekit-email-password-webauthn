<script lang="ts">
    import FeedCreator from '$lib/components/feed-creator.svelte';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>

<FeedCreator />