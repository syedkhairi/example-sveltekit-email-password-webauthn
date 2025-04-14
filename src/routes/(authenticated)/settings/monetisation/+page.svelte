<script lang="ts">
    import type { PageData } from './$types';
    import { Separator } from "$lib/components/ui/separator/index.js";	

    let { data }: { data: PageData } = $props();
</script>

<div class="space-y-6">
	<div>
		<h3 class="text-lg font-medium">Monetisation</h3>
		<p class="text-muted-foreground text-sm">
            Set up your monetisation options and manage your earnings including payment methods.
		</p>
	</div>

    <Separator />
</div>