<script lang="ts">
	import type { PageData } from "./$types";
	import VerifyEmailForm from "./verify-email-form.svelte";
	import * as Card from "$lib/components/ui/card/index.js";

	let { data } : { data: PageData} = $props();
</script>

<Card.Root class="mx-auto max-w-sm">
	<Card.Header>
		<Card.Title class="text-2xl">Verify your email address</Card.Title>
		<Card.Description>We sent an 8-digit code to {data.email}.</Card.Description>
	</Card.Header>
	<Card.Content>
		<VerifyEmailForm data={data.form} />
	</Card.Content>
</Card.Root>
