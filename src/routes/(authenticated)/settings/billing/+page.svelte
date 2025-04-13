<script lang="ts">
    import type { PageData } from './$types';
    import { Separator } from "$lib/components/ui/separator/index.js";	

    let { data }: { data: PageData } = $props();
</script>

<div class="space-y-6">
	<div>
		<h3 class="text-lg font-medium">Billing</h3>
		<p class="text-muted-foreground text-sm">
            Manage your subscription and billing information.
		</p>
	</div>

    <Separator />
</div>