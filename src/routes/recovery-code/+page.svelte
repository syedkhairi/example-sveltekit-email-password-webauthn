<script lang="ts">
	import SuperDebug from "sveltekit-superforms";
	import type { PageData } from "./$types";
	import { dev } from "$app/environment";
	import { Button } from "$lib/components/ui/button/index.js";

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<div class="max-w-md mx-auto p-4 space-y-4">
	<div>
		<h1 class="text-2xl font-bold">Recovery code</h1>
		<p class="text-muted-foreground text-sm">
			This is your recovery code. You can use this recovery code if you lose access to your second factors.
		</p>
	</div>

	<SuperDebug
		data={data.recoveryCode}
		status={false}
	/>

	<Button class="w-full" href="/">
		Return home
	</Button>
</div>

