<script lang="ts">
	import { enhance } from "$app/forms";

	import type { PageData } from "./$types";

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>
