<script lang="ts">
	import { enhance } from "$app/forms";

	import type { PageData } from "./$types";

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<header>
	<a href="/">Home</a>
	<a href="/settings">Settings</a>
</header>
<main>
	<h1>Hi {data.user.username}!</h1>
	<form method="post" use:enhance>
		<button>Sign out</button>
	</form>
</main>
