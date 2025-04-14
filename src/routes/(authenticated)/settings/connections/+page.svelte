<script lang="ts">
    import type { PageData } from './$types';
    import { Separator } from "$lib/components/ui/separator/index.js";	
	import ConnectionsForm from './connections-form.svelte';

    let { data }: { data: PageData } = $props();
</script>

<div class="space-y-6">
	<div>
		<h3 class="text-lg font-medium">Connections</h3>
		<p class="text-muted-foreground text-sm">
            Manage your stored Bluesky account connections securely.
		</p>
	</div>

    <Separator />
    <ConnectionsForm data={data.connectionsForm} />
</div>