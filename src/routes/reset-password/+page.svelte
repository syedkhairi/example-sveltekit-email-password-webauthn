<script lang="ts">
	import type { PageData } from "../$types";
	import ResetPasswordForm from "./reset-password-form.svelte";

	let { data } = $props();
</script>

<ResetPasswordForm data={data.form} />

<!-- 
<h1>Enter your new password</h1>
<form method="post" use:enhance>
	<label for="form-reset.password">Password</label>
	<input type="password" id="form-reset.password" name="password" autocomplete="new-password" required /><br />
	<button>Reset password</button>
	<p>{form?.message ?? ""}</p>
</form> -->
