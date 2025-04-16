<script lang="ts">
    import type { PageData } from './$types';
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import EllipsisVertical from "@lucide/svelte/icons/ellipsis-vertical";
    import RefreshCcw from "@lucide/svelte/icons/refresh-ccw";
    import Pencil from "@lucide/svelte/icons/pencil";
    import Share from "@lucide/svelte/icons/share";
    import ExternalLink from "@lucide/svelte/icons/external-link";
    
    let { data }: { data: PageData } = $props();
</script>

{#snippet card()}
    <div class="rounded-md border bg-muted px-4 py-3.5 space-y-5 w-[400px]">
        <div class="flex flex-row items-center justify-between gap-4">
            <div class="aspect-square size-10 rounded-md bg-blue-600 flex items-center justify-center">
                IC
            </div>
            <div class="flex flex-col">
                <h2 class="text-sm font-semibold">Design Engineering</h2>
                <p class="text-xs text-muted-foreground line-clamp-1">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
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

        <div class="flex flex-row gap-3">
            <div class="rounded-full bg-green-600 size-8 text-sm flex shrink-0 items-center justify-center">
                JK
            </div>
            <div class="space-y-1">
                <div class="flex flex-row gap-1.5 items-center flex-1">
                    <span class="text-sm font-semibold">John Doe</span>
                    <span class="text-xs text-muted-foreground">@johndoe</span>
                    <span class="text-xs text-muted-foreground ml-auto">1h</span>
                </div>
                <p class="text-sm">
                    Lorem ipsum dolor sit, amet consectetur adipisicing elit. Dolore officia consequuntur cupiditate quod sint debitis cumque ad reprehenderit commodi non eveniet officiis repudiandae fugit inventore, in porro nemo molestiae sed.
                </p>
            </div>
        </div>
    </div>
{/snippet}

<div class="block h-[97%] space-y-4">
    <h1 class="uppercase tracking-wide text-xs text-muted-foreground">My feeds</h1>
    <div class="h-full">
        <ScrollArea class="size-full" orientation="horizontal">
            <div class="flex flex-row gap-4 flex-1 h-full">
                {@render card()}
                {@render card()}
                {@render card()}
                {@render card()}
                {@render card()}
                {@render card()}
            </div>
        </ScrollArea>
    </div>
</div>