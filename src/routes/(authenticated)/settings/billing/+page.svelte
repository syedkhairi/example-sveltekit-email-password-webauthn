<script lang="ts">
    import type { PageData } from './$types';
    import { Separator } from "$lib/components/ui/separator/index.js";
    import { Button } from "$lib/components/ui/button/index.js";	
	import SquareArrowOutUpRight from '@lucide/svelte/icons/square-arrow-out-up-right';

    let { data }: { data: PageData } = $props();

    let subscriber = true;
</script>

<div class="space-y-6">
	<div>
		<h3 class="text-lg font-medium">Billing</h3>
		<p class="text-muted-foreground text-sm">
            Manage your subscription and billing information.
		</p>
	</div>

    <Separator />

    {#if subscriber}
        <p>
            You have an active Pro monthly subscription.
        </p>
    {:else}
        <p>
            You are currently on the free plan.
        </p>
    {/if}

    <div class="space-y-4">
        {#if subscriber}
            <Button
                class="w-full"
                href="/settings/monetisation/stripe"
            >
                Go to my subscription portal
                <SquareArrowOutUpRight class="ml-1 !size-3" />
            </Button>
        {:else}
            <Button
                class="w-full"
                href="/upgrade"
            >
                Upgrade to Pro
            </Button>
        {/if}

        <p class="text-muted-foreground text-sm">
            All subscriptions and payments are managed by Paddle, our merchant of record. We do not hold any payment information. For more information on our terms and conditions including refunds, please visit our <a href="https://oslo.dev/terms" target="_blank" rel="noopener noreferrer" class="underline underline-offset-2 hover:text-blue-800">terms and conditions</a> page.
        </p>
    </div>
</div>