<script lang="ts">
	import { enhance } from "$app/forms";
	import * as InputOTP from "$lib/components/ui/input-otp/index.js";

	import type { ActionData, PageData } from "./$types";

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();
</script>

<h1>Verify your email address</h1>
<p>We sent an 8-digit code to {data.email}.</p>
<form method="post" use:enhance>
	<InputOTP.Root maxlength={8}>
		{#snippet children({ cells })}
			<InputOTP.Group>
				{#each cells as cell (cell)}
					<InputOTP.Slot {cell} />
				{/each}
			</InputOTP.Group>
		{/snippet}
	</InputOTP.Root>
	<label for="form-verify.code">Code</label>
	<input id="form-verify.code" name="code" required />
	<button>verify</button>
	<p>{form?.message ?? ""}</p>
</form>
