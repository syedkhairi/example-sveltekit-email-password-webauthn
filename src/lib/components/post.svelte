<script lang="ts" module>
    export type PostType = {
        text: string;
        datetime: string;
        username: string;
        avatarUrl: string;
        name: string;
        likes: number
    }
</script>

<script lang="ts">
    import { Button } from "$lib/components/ui/button/index.js";
    import * as Avatar from "$lib/components/ui/avatar/index.js";
    import Heart from "@lucide/svelte/icons/heart";
    import Repeat from "@lucide/svelte/icons/repeat-2";
    import Message from "@lucide/svelte/icons/message-square";

    let {
        text,
        datetime,
        username,
        name,
        avatarUrl,
        likes
    } : PostType = $props();

    const initialsFromName = (name: string) => {
        const words = name.trim().split(/\s+/);
        if (words.length === 0) return '';

        if (words.length === 1) {
            return words[0].charAt(0).toUpperCase();
        }

        return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
    }
    
    let dateSinceAgo = $derived.by(() => {
        const date = new Date(datetime);
        const now = new Date();
        const postDate = new Date(date);
        const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);

        if (diffInSeconds < 60) {
            return `${diffInSeconds}s`;
        } else if (diffInSeconds < 3600) {
            return `${Math.floor(diffInSeconds / 60)}m`;
        } else if (diffInSeconds < 86400) {
            return `${Math.floor(diffInSeconds / 3600)}h`;
        } else {
            return `${Math.floor(diffInSeconds / 86400)}d`;
        }
    });
</script>

<div class="flex flex-row gap-3">
    <a href="#" target="_blank" title={`Go to ${username}'s profile`} class="flex-shrink-0">
        <Avatar.Root class="size-8 mt-0.5">
            <Avatar.Image src={avatarUrl} alt={username} />
            <Avatar.Fallback>{initialsFromName(name)}</Avatar.Fallback>
        </Avatar.Root>
    </a>
    <div class="w-full">
        <div class="flex flex-row gap-1.5 items-center flex-1 mb-1">
            <a href="#" title={`View ${name}'s profile`} target="_blank" class="text-sm font-semibold line-clamp-1 hover:underline hover:underline-offset-2">{name}</a>
            <span class="text-xs text-muted-foreground truncate">@{username}</span>
            <a href="#" title="View this post in Bluesky app" target="_blank" class="text-xs text-muted-foreground ml-auto hover:underline hover:underline-offset-2">{dateSinceAgo}</a>
        </div>
        <p class="text-sm prose *:[$:">
            {@html text}
        </p>
        <div class="grid grid-cols-3 mt-2">
            <Button
                variant="ghost"
                size="icon"
                class="size-6"
                >
                <Heart class="text-muted-foreground !size-3.5" />
                <span class="text-muted-foreground text-xs">{likes ? likes : null}</span>
            </Button>
            <Button
                variant="ghost"
                size="icon"
                class="size-6"
                >
                <Repeat class="text-muted-foreground !size-4" />
                <span class="text-muted-foreground text-xs">{Math.floor(Math.random() * 100)}</span>
            </Button>
            <Button
                variant="ghost"
                size="icon"
                class="size-6"
                >
                <Message class="text-muted-foreground !size-3.5" />
                <span class="text-muted-foreground text-xs">{Math.floor(Math.random() * 100)}</span>
            </Button>
        </div>
    </div>
</div>