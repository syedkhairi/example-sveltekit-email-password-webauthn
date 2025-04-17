<script lang="ts">
    import type { PageData } from './$types';
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Separator } from "$lib/components/ui/separator/index.js";
    import EllipsisVertical from "@lucide/svelte/icons/ellipsis-vertical";
    import RefreshCcw from "@lucide/svelte/icons/refresh-ccw";
    import Pencil from "@lucide/svelte/icons/pencil";
    import Share from "@lucide/svelte/icons/share";
    import ExternalLink from "@lucide/svelte/icons/external-link";
	import Post from '$lib/components/post.svelte';
    
    let { data }: { data: PageData } = $props();
</script>

{#snippet card()}
    <div class="rounded-lg border bg-muted pt-3.5 space-y-5 w-[400px] h-[calc(100vh-130px)] flex flex-col">
        <div class="flex flex-row items-center justify-between gap-4 px-4">
            <div class="aspect-square size-10 rounded-lg bg-blue-600 flex items-center justify-center">
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
        <ScrollArea orientation="vertical" class="relative">
            <!-- <div class="absolute inset-x-0 top-1 text-center">
                <Button
                    variant="outline"
                    size="sm"
                    class="rounded-full text-xs !h-7"
                    >
                    New posts
                </Button>
            </div> -->
            <div class="space-y-3 px-4">
                {#each data.posts as post}
                    <Post
                        text={post.text}
                        name={post.name || "Unknown"}
                        username={post.username}
                        datetime={post.datetime}
                        avatarUrl={post.avatarUrl || ""}
                        likes={post.likes || 0}
                        />
                    <Separator class="last:hidden" />
                {:else}
                    <div class="flex flex-col items-center justify-center h-full gap-3">
                        <span class="text-xs text-muted-foreground">No posts found for this feed</span>
                        <div class="space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                >
                                Edit feed
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                >
                                View on Bsky
                            </Button>
                        </div>
                    </div>
                {/each}
            </div>
        </ScrollArea>
    </div>
{/snippet}

<div class="flex flex-col h-full w-full overflow-hidden space-y-4">
    <h1 class="uppercase tracking-wide text-xs text-muted-foreground pl-4">My feeds</h1>
    <ScrollArea class="flex-1" orientation="horizontal">
        <div class="flex flex-row gap-4 mx-4">
            {@render card()}
            {@render card()}
            {@render card()}
            {@render card()}
            {@render card()}
            {@render card()}
        </div>
    </ScrollArea>
</div>