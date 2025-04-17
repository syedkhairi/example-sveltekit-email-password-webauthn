<script lang="ts" module>
    export type PostHeaderType = {
        feedName: string;
        feedDescription: string;
        feedAtiUrl: string;
        feedAvatarUrl: string;
    }
</script>

<script lang="ts">
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import RefreshCcw from "@lucide/svelte/icons/refresh-ccw";
    import Pencil from "@lucide/svelte/icons/pencil";
    import Share from "@lucide/svelte/icons/share";
    import ExternalLink from "@lucide/svelte/icons/external-link";
    import EllipsisVertical from "@lucide/svelte/icons/ellipsis-vertical";

    let { feedName, feedDescription, feedAtiUrl, feedAvatarUrl }: PostHeaderType = $props();
</script>

<div class="flex flex-row items-center justify-between gap-4 px-4">
    <div class="aspect-square size-10 rounded-lg bg-blue-600 flex items-center justify-center">
        IC
    </div>
    <div class="flex flex-col grow">
        <h2 class="text-sm font-semibold">{feedName}</h2>
        <p class="text-xs text-muted-foreground line-clamp-1">{feedDescription}</p>
    </div>
    <DropdownMenu.Root>
        <DropdownMenu.Trigger>
            {#snippet child({ props })}
                <Button
                    variant="ghost"
                    size="icon"
                    {...props}
                >
                    <EllipsisVertical class="size-4" />
                </Button>
            {/snippet}
        </DropdownMenu.Trigger>
        <DropdownMenu.Content 
            side="bottom" 
            align="start"
            class="w-44"
        >
            <DropdownMenu.Group>
                <DropdownMenu.Item class="space-x-1">
                    <RefreshCcw class="text-muted-foreground" />
                    <span>Refresh feed</span>
                </DropdownMenu.Item>
                <DropdownMenu.Separator />
                <DropdownMenu.Item class="space-x-1">
                    <Pencil class="text-muted-foreground" />
                    <span>Edit feed</span>
                </DropdownMenu.Item>
                <DropdownMenu.Item class="space-x-1">
                    <Share class="text-muted-foreground" />
                    <span>Share feed</span>
                </DropdownMenu.Item>
                <DropdownMenu.Item class="space-x-1">
                    <ExternalLink class="text-muted-foreground" />
                    <span>View in Bluesky</span>
                </DropdownMenu.Item>
            </DropdownMenu.Group>
        </DropdownMenu.Content>
    </DropdownMenu.Root>
</div>