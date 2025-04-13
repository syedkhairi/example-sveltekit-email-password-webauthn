<script lang="ts">
    import type { Snippet } from 'svelte';
    import type { LayoutData } from './$types';

    let { data, children }: { data: LayoutData, children: Snippet } = $props();
</script>

<div class="flex h-screen w-full items-center justify-center px-4">
    {@render children()}
</div>
