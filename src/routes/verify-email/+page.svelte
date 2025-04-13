<script lang="ts">
	import { enhance } from "$app/forms";

	import type { ActionData, PageData } from "./$types";
	import VerifyEmailForm from "./verify-email-form.svelte";

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();
</script>


<div class="max-w-2xl mx-auto p-4 space-y-4">
	<div>
		<h1 class="text-2xl font-bold">Verify your email address</h1>
		<p class="text-muted-foreground text-sm">
			We sent an 8-digit code to {data.email}.
		</p>
	</div>

	<VerifyEmailForm data={data.form} />
	<form method="post" use:enhance action="?/resend">
		<button>Resend code</button>
		<p>{form?.resend?.message ?? ""}</p>
	</form>
	<a href="/settings">Change your email</a>
</div>