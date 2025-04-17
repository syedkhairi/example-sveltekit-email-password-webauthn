<script lang="ts">
	import ContainerPostsHeader, { type PostHeaderType } from "./container-posts-header.svelte";
    import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Separator } from "$lib/components/ui/separator/index.js";
    import Post from '$lib/components/post.svelte';
    import type { PostType } from '$lib/components/post.svelte';
    import { flyAndScale } from '$lib/utils';

    type Props = {
        initPosts: PostType[];
        feed: {
            name: string;
            description: string;
            atiUrl: string;
            avatarUrl: string;
        };
    };

    let { initPosts, feed }: Props = $props();

    let hasNewPosts = $state(false);
    let posts = $state<PostType[]>(initPosts);
    let newPosts = $state<PostType[]>([]);
    let cursor = $state<string | null>(null);
</script>

<div class="rounded-lg border bg-muted pt-3.5 space-y-5 w-[400px] h-[calc(100vh-130px)] flex flex-col">
    <ContainerPostsHeader 
        feedName={feed.name}
        feedDescription={feed.description}
        feedAtiUrl={feed.atiUrl}
        feedAvatarUrl={feed.avatarUrl}
    />
    
    <ScrollArea orientation="vertical" class="relative">
        {#if hasNewPosts}
            <div class="absolute inset-x-0 top-1 text-center" transition:flyAndScale>
                <Button
                    variant="outline"
                    size="sm"
                    class="rounded-full text-xs !h-7"
                    onclick={async () => {
                        hasNewPosts = false;
                        posts = [...newPosts, ...posts]; 
                        newPosts = [];
                    }}
                    >
                    New posts
                </Button>
            </div>
        {/if}
        <div class="space-y-3 px-4">
            {#each posts as post}
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