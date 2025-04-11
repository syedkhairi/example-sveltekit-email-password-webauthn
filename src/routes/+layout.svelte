<script lang="ts">
	import "../app.css";
	import type { Snippet } from "svelte";
	import { ModeWatcher } from "mode-watcher";

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();
</script>

<ModeWatcher />

<svelte:head>
	<title>Email and password example with 2FA and WebAuthn in SvelteKit</title>
</svelte:head>

{@render children?.()}
