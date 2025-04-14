<script lang="ts">
    import type { PageData } from './$types';
    import { Separator } from "$lib/components/ui/separator/index.js";	
    import * as Alert from "$lib/components/ui/alert/index.js";
	import ConnectionsForm from './connections-form.svelte';
    import Info from "@lucide/svelte/icons/info";

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

    <Alert.Root>
        <Info class="size-4 mt-0.5" />
        <Alert.Description>
            At the moment, we only support connections to 
            <code
                class="bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold"
            >
                bsky.social
            </code>
            domain or server.
        </Alert.Description>
    </Alert.Root>

    <ConnectionsForm data={data.connectionsForm} />
</div>