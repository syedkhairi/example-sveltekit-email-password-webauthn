<script lang="ts">
	import type { Snippet } from "svelte";

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();
</script>

<svelte:head>
	<title>Email and password example with 2FA and WebAuthn in SvelteKit</title>
</svelte:head>

{@render children?.()}
