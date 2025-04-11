<script lang="ts">
	import type { PageData } from "./$types";

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<h1>Recovery code</h1>
<p>Your recovery code is: {data.recoveryCode}</p>
<p>You can use this recovery code if you lose access to your second factors.</p>
<a href="/">Next</a>
