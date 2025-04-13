<script lang="ts">
	import type { ActionData, PageData } from "./$types";
	import ForgotPassword from "./forgot-password.svelte";

	let { data }: { data: PageData } = $props();
</script>

<div class="flex h-screen w-full items-center justify-center px-4">
	<ForgotPassword data={data.form} />
</div>

<!-- <h1>Forgot your password?</h1>
<form method="post" use:enhance>
	<label for="form-forgot.email">Email</label>
	<input type="email" id="form-forgot.email" name="email" required value={form?.email ?? ""} /><br />
	<button>Send</button>
	<p>{form?.message ?? ""}</p>
</form>
<a href="/login">Sign in</a> -->
