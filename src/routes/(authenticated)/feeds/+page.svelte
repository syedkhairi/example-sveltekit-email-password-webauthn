<script lang="ts">
    import type { PageData } from './$types';
    import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
	import type { PostType } from '$lib/components/post.svelte';
    import ContainerPosts from './(components)/container-posts.svelte';

    let { data }: { data: PageData } = $props();
    let posts = $state<PostType[]>(data.posts.map(post => ({
        ...post,
        name: post.name || '',
        avatarUrl: post.avatarUrl || '',
        text: post.text,
        datetime: post.datetime,
        username: post.username,
        likes: post.likes !== undefined ? post.likes : 0
    })));
</script>

{#snippet card()}
    <ContainerPosts 
        initPosts={posts} 
        feed={{
            name: "Hi",
            description: "hlak",
            atiUrl: "https://example.com",
            avatarUrl: "https://example.com/avatar.png"  
        }}
        />
{/snippet}

<div class="flex flex-col h-full w-full overflow-hidden space-y-4">
    <h1 class="uppercase tracking-wide text-xs text-muted-foreground pl-4">My feeds</h1>
    <ScrollArea class="flex-1" orientation="horizontal">
        <div class="flex flex-row gap-4 mx-4">
            {@render card()}
        </div>
    </ScrollArea>
</div>