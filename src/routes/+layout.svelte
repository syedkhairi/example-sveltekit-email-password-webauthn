<script lang="ts">
	import '@xyflow/svelte/dist/style.css';
	import "../app.css";
	import type { Snippet } from "svelte";
	import { ModeWatcher } from "mode-watcher";
	import { Toaster } from "$lib/components/ui/sonner/index.js";

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();
</script>

<ModeWatcher />
<Toaster position="top-right" />

<svelte:head>
	<title>Email and password example with 2FA and WebAuthn in SvelteKit</title>
</svelte:head>

{@render children?.()}
